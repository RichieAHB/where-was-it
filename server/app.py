import astropy.units as u
from astropy.coordinates import AltAz, EarthLocation, get_sun, get_moon
from astropy.time import Time
from flask import Flask, request, abort, jsonify
from flask_cors import CORS
from sunpy.coordinates import get_earth

app = Flask(__name__)
CORS(app)


@app.route('/get_earth_then')
def get_earth_then():
    frame = get_observer_frame(*get_lat_lng())
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
    frame = get_observer_frame(*get_lat_lng())
    sun_pos = get_in_frame(get_sun, frame)
    moon_pos = get_in_frame(get_moon, frame)
    return jsonify({
        'sun': pick_rad(sun_pos, ['alt', 'az']),
        'moon': pick_rad(moon_pos, ['alt', 'az'])
    })


def get_observer_frame(lat, lon):
    earth_location = EarthLocation.from_geodetic(lat, lon)
    now = Time.now()
    print(now)
    return AltAz(location=earth_location, obstime=now)


def get_in_frame(getter, frame, time=None):
    return getter(time or frame.obstime).transform_to(frame)


def pick_rad(pos, keys):
    return {key: getattr(pos, key).rad for key in keys}


def get_lat_lng():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    if lat is None or lon is None:
        abort(400, "`lat` and `lon` must be specified in the query params")
    return float(lon), float(lat)


def get_when():
    when = request.args.get("when")
    if when is None:
        abort(400, "`when` must be specified in the query params")
    return when


# only run this locally
if __name__ == '__main__':
    app.run(host='0.0.0.0', ssl_context=('localcerts/localhost+3.pem', 'localcerts/localhost+3-key.pem'), debug=True)
