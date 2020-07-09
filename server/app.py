import astropy.units as u
from astropy.coordinates import AltAz, EarthLocation, get_sun, get_moon
from astropy.time import Time
from flask import Flask, request, abort, jsonify, make_response
from flask_cors import CORS
from sunpy.coordinates import get_earth

app = Flask(__name__)
CORS(app)


# health check
@app.route('/')
def health_check():
    return 'ok', 200


@app.route('/get_earth_then')
def get_earth_then():
    frame = get_observer_frame(*get_lat_lng(), get_tz_offset())
    then = Time(get_when())
    earth_pos_then = get_in_frame(get_earth, frame, then)
    earth_pos_now = get_in_frame(get_earth, frame)
    distance = earth_pos_then.separation_3d(earth_pos_now).to(u.imperial.mile)
    return jsonify({
        'earth': pick_rad(earth_pos_then, ['alt', 'az']),
        'distance_miles': distance.value
    })


@app.route('/get_bodies')
def get_bodies():
    frame = get_observer_frame(*get_lat_lng(), get_tz_offset())
    sun_pos = get_in_frame(get_sun, frame)
    moon_pos = get_in_frame(get_moon, frame)
    return jsonify({
        'sun': pick_rad(sun_pos, ['alt', 'az']),
        'moon': pick_rad(moon_pos, ['alt', 'az'])
    })


# @app.after_request
# def after(response):
#     print(response.get_data(as_text=True))
#     return response


def get_observer_frame(lat, lon, tz_offset_mins):
    earth_location = EarthLocation.from_geodetic(lat, lon)
    now = Time.now() - (tz_offset_mins * u.min)
    return AltAz(location=earth_location, obstime=now)


def get_in_frame(getter, frame, time=None):
    return getter(time or frame.obstime).transform_to(frame)


def pick_rad(pos, keys):
    return {key: getattr(pos, key).rad for key in keys}


def get_lat_lng():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    if lat is None or lon is None:
        abort(make_response(jsonify(message="`lat` and `lon` must be specified in the query params"), 400))
    return float(lon), float(lat)


def get_tz_offset():
    offset = request.args.get("tz_offset_mins")
    if offset is None:
        abort(make_response(jsonify(message="`tz_offset_mins` must be specified in the query params"), 400))
    return float(offset)


def get_when():
    when = request.args.get("when")
    if when is None:
        abort(make_response(jsonify(message="`when` must be specified in the query params"), 400))
    return when


# only run this locally
if __name__ == '__main__':
    app.run(host='0.0.0.0', ssl_context=('localcerts/localhost+3.pem', 'localcerts/localhost+3-key.pem'), debug=True)
