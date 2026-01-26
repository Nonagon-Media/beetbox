"""Beetbox - Modern Web Interface for Beets Music Library

Standalone Flask application adapted from the beets web plugin.
Provides RESTful API endpoints for browsing, streaming, and managing
a beets music library.
"""

import base64
import json
import os
from pathlib import Path

import beets.library
from beets import util
from beets.dbcore.query import PathQuery
from flask import Flask, Response, abort, g, jsonify, request, send_file
from flask_cors import CORS
from unidecode import unidecode
from werkzeug.routing import BaseConverter, PathConverter

# Configuration from environment
MUSIC_PATH = os.environ.get("MUSIC_PATH", "/music")
BEETS_DB_PATH = os.environ.get("BEETS_DB_PATH", "/data/library.db")
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8337"))
READONLY = os.environ.get("READONLY", "true").lower() == "true"
INCLUDE_PATHS = os.environ.get("INCLUDE_PATHS", "false").lower() == "true"
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")

# Flask application
app = Flask(__name__)
app.config["JSONIFY_PRETTYPRINT_REGULAR"] = False
app.config["READONLY"] = READONLY
app.config["INCLUDE_PATHS"] = INCLUDE_PATHS

# Enable CORS
CORS(app, resources={r"/*": {"origins": CORS_ORIGIN}})


# URL Converters


class IdListConverter(BaseConverter):
    """Converts comma-separated lists of IDs in URLs to integer lists."""

    def to_python(self, value: str) -> list[int]:
        ids = []
        for id_str in value.split(","):
            try:
                ids.append(int(id_str))
            except ValueError:
                pass
        return ids

    def to_url(self, value: list[int]) -> str:
        return ",".join(str(v) for v in value)


class QueryConverter(PathConverter):
    """Converts slash-separated lists of queries in URLs to string lists."""

    def to_python(self, value: str) -> list[str]:
        queries = value.split("/")
        return [
            query if "::" in query else query.replace("\\", os.sep)
            for query in queries
        ]

    def to_url(self, value: list[str]) -> str:
        return "/".join([v.replace(os.sep, "\\") for v in value])


class EverythingConverter(PathConverter):
    """Matches any path including slashes."""

    part_isolating = False
    regex = ".*?"


app.url_map.converters["idlist"] = IdListConverter
app.url_map.converters["query"] = QueryConverter
app.url_map.converters["everything"] = EverythingConverter


# Database connection


def get_library() -> beets.library.Library:
    """Get or create the beets library connection."""
    if "lib" not in g:
        g.lib = beets.library.Library(BEETS_DB_PATH)
    return g.lib


@app.before_request
def before_request():
    """Set up library connection before each request."""
    g.lib = get_library()


@app.teardown_appcontext
def teardown_library(exception):
    """Close library connection after request."""
    lib = g.pop("lib", None)
    if lib is not None:
        lib._close()


# Utility functions


def _rep(obj, expand: bool = False) -> dict:
    """Get a JSON-serializable representation of a beets Item or Album."""
    out = dict(obj)

    if isinstance(obj, beets.library.Item):
        if app.config.get("INCLUDE_PATHS", False):
            out["path"] = util.displayable_path(out["path"])
        else:
            out.pop("path", None)

        # Convert bytes to base64 strings
        for key, value in list(out.items()):
            if isinstance(value, bytes):
                out[key] = base64.b64encode(value).decode("ascii")

        # Get file size
        try:
            out["size"] = os.path.getsize(util.syspath(obj.path))
        except OSError:
            out["size"] = 0

        return out

    elif isinstance(obj, beets.library.Album):
        if app.config.get("INCLUDE_PATHS", False):
            out["artpath"] = util.displayable_path(out.get("artpath"))
        else:
            out.pop("artpath", None)

        if expand:
            out["items"] = [_rep(item) for item in obj.items()]

        return out

    return out


def json_generator(items, root: str, expand: bool = False):
    """Generator that yields JSON for a list of beets Items or Albums."""
    yield f'{{"{root}":['
    first = True
    for item in items:
        if first:
            first = False
        else:
            yield ","
        yield json.dumps(_rep(item, expand=expand))
    yield "]}"


def is_expand() -> bool:
    """Check if the current request wants expanded response."""
    return request.args.get("expand") is not None


def is_delete() -> bool:
    """Check if delete request should remove files."""
    return request.args.get("delete") is not None


def _get_unique_table_field_values(model, field: str, sort_field: str) -> list:
    """Retrieve all unique values for a field from a model."""
    if field not in model.all_keys() or sort_field not in model.all_keys():
        raise KeyError(f"Invalid field: {field}")

    with g.lib.transaction() as tx:
        rows = tx.query(
            f"SELECT DISTINCT {field} FROM {model._table} ORDER BY {sort_field}"
        )
    return [row[0] for row in rows]


# Decorators for resource handling


def resource(name: str, patchable: bool = False):
    """Decorator for RESTful resource endpoints."""

    def make_responder(retriever):
        def responder(ids):
            entities = [retriever(id) for id in ids]
            entities = [e for e in entities if e]

            if request.method == "DELETE":
                if app.config.get("READONLY", True):
                    return abort(405)
                for entity in entities:
                    entity.remove(delete=is_delete())
                return jsonify({"deleted": True})

            elif request.method == "PATCH" and patchable:
                if app.config.get("READONLY", True):
                    return abort(405)
                for entity in entities:
                    entity.update(request.get_json())
                    entity.try_sync(True, False)

                if len(entities) == 1:
                    return jsonify(_rep(entities[0], expand=is_expand()))
                elif entities:
                    return Response(
                        json_generator(entities, root=name),
                        mimetype="application/json",
                    )

            elif request.method == "GET":
                if len(entities) == 1:
                    return jsonify(_rep(entities[0], expand=is_expand()))
                elif entities:
                    return Response(
                        json_generator(entities, root=name),
                        mimetype="application/json",
                    )
                else:
                    return abort(404)

            return abort(405)

        responder.__name__ = f"get_{name}"
        return responder

    return make_responder


def resource_query(name: str, patchable: bool = False):
    """Decorator for RESTful query endpoints."""

    def make_responder(query_func):
        def responder(queries):
            entities = list(query_func(queries))

            if request.method == "DELETE":
                if app.config.get("READONLY", True):
                    return abort(405)
                for entity in entities:
                    entity.remove(delete=is_delete())
                return jsonify({"deleted": True})

            elif request.method == "PATCH" and patchable:
                if app.config.get("READONLY", True):
                    return abort(405)
                for entity in entities:
                    entity.update(request.get_json())
                    entity.try_sync(True, False)
                return Response(
                    json_generator(entities, root=name),
                    mimetype="application/json",
                )

            elif request.method == "GET":
                return Response(
                    json_generator(entities, root="results", expand=is_expand()),
                    mimetype="application/json",
                )

            return abort(405)

        responder.__name__ = f"query_{name}"
        return responder

    return make_responder


def resource_list(name: str):
    """Decorator for listing all resources."""

    def make_responder(list_all):
        def responder():
            return Response(
                json_generator(list_all(), root=name, expand=is_expand()),
                mimetype="application/json",
            )

        responder.__name__ = f"all_{name}"
        return responder

    return make_responder


# Item (Track) endpoints


@app.route("/item/<idlist:ids>", methods=["GET", "DELETE", "PATCH"])
@resource("items", patchable=True)
def get_item(id: int):
    """Get, update, or delete an item by ID."""
    return g.lib.get_item(id)


@app.route("/item/")
@app.route("/item/query/")
@resource_list("items")
def all_items():
    """List all items."""
    return g.lib.items()


@app.route("/item/<int:item_id>/file")
def item_file(item_id: int):
    """Stream or download an audio file."""
    item = g.lib.get_item(item_id)
    if not item:
        return abort(404)

    item_path = util.syspath(item.path)
    base_filename = os.path.basename(item_path)

    try:
        base_filename.encode("latin-1", "strict")
        safe_filename = base_filename
    except UnicodeError:
        safe_filename = unidecode(base_filename)

    return send_file(item_path, as_attachment=True, download_name=safe_filename)


@app.route("/item/query/<query:queries>", methods=["GET", "DELETE", "PATCH"])
@resource_query("items", patchable=True)
def item_query(queries: list[str]):
    """Query items with beets query syntax."""
    return g.lib.items(queries)


@app.route("/item/path/<everything:path>")
def item_at_path(path: str):
    """Get item at a specific file path."""
    query = PathQuery("path", path.encode("utf-8"))
    item = g.lib.items(query).get()
    if item:
        return jsonify(_rep(item))
    return abort(404)


@app.route("/item/values/<string:key>")
def item_unique_field_values(key: str):
    """Get unique values for an item field."""
    sort_key = request.args.get("sort_key", key)
    try:
        values = _get_unique_table_field_values(beets.library.Item, key, sort_key)
    except KeyError:
        return abort(404)
    return jsonify(values=values)


# Album endpoints


@app.route("/album/<idlist:ids>", methods=["GET", "DELETE"])
@resource("albums")
def get_album(id: int):
    """Get or delete an album by ID."""
    return g.lib.get_album(id)


@app.route("/album/")
@app.route("/album/query/")
@resource_list("albums")
def all_albums():
    """List all albums."""
    return g.lib.albums()


@app.route("/album/query/<query:queries>", methods=["GET", "DELETE"])
@resource_query("albums")
def album_query(queries: list[str]):
    """Query albums with beets query syntax."""
    return g.lib.albums(queries)


@app.route("/album/<int:album_id>/art")
def album_art(album_id: int):
    """Get album artwork."""
    album = g.lib.get_album(album_id)
    if album and album.artpath:
        return send_file(album.artpath.decode())
    return abort(404)


@app.route("/album/values/<string:key>")
def album_unique_field_values(key: str):
    """Get unique values for an album field."""
    sort_key = request.args.get("sort_key", key)
    try:
        values = _get_unique_table_field_values(beets.library.Album, key, sort_key)
    except KeyError:
        return abort(404)
    return jsonify(values=values)


# Artist endpoints


@app.route("/artist/")
def all_artists():
    """List all unique artists."""
    with g.lib.transaction() as tx:
        rows = tx.query("SELECT DISTINCT albumartist FROM albums ORDER BY albumartist")
    artists = [row[0] for row in rows if row[0]]
    return jsonify(artist_names=artists)


# Statistics endpoint


@app.route("/stats")
def stats():
    """Get library statistics."""
    with g.lib.transaction() as tx:
        item_count = tx.query("SELECT COUNT(*) FROM items")[0][0]
        album_count = tx.query("SELECT COUNT(*) FROM albums")[0][0]
        artist_count = tx.query("SELECT COUNT(DISTINCT albumartist) FROM albums")[0][0]
        total_duration = tx.query("SELECT SUM(length) FROM items")[0][0] or 0
        total_size = tx.query("SELECT SUM(filesize) FROM items")[0][0] or 0
        genres = tx.query("SELECT COUNT(DISTINCT genre) FROM items")[0][0]

    return jsonify({
        "items": item_count,
        "albums": album_count,
        "artists": artist_count,
        "total_duration": total_duration,
        "total_size": total_size,
        "genres": genres,
    })


# Health check


@app.route("/health")
def health():
    """Health check endpoint for Kubernetes."""
    try:
        with g.lib.transaction() as tx:
            tx.query("SELECT 1")
        return jsonify({"status": "healthy", "database": "connected"})
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500


# Root redirect to frontend


@app.route("/")
def root():
    """Redirect root to API info."""
    return jsonify({
        "name": "Beetbox API",
        "version": "1.0.0",
        "endpoints": {
            "items": "/item/",
            "albums": "/album/",
            "artists": "/artist/",
            "stats": "/stats",
            "health": "/health",
        }
    })


if __name__ == "__main__":
    print(f"Starting Beetbox API server...")
    print(f"Database: {BEETS_DB_PATH}")
    print(f"Music path: {MUSIC_PATH}")
    print(f"Readonly mode: {READONLY}")
    print(f"Listening on {HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=True)
