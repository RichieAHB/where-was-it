# Where was it?

## What is this?

`Where was it?` is a toy project to show where the earth was in the sky (relative to the observer) at a given time in the past.

This was born out of a shower thought, wondering how far I was away from where I was born in the universe. It turned out it was a bit easier to answer that question for "the solar system" rather than the universe.

Kubernetes is definitely overkill for this but it was fun to see how user-friendly it might be for a project of this size. It turns out, now it's setup, it's extremely nice to use!

## Technologies

### Frontend

- [React](https://reactjs.org/) - View rendering, client-side state
- [Typescript](https://www.typescriptlang.org/) - Typed frontend language
- [Three.js](https://threejs.org/) - 3D Rendering of the body positions
- [Styled Components](https://styled-components.com/) - CSS-in-JS library
- [Parcel](https://parceljs.org/) - Bundler for the client-side code

### Backend

- [Flask](https://flask.palletsprojects.com/en/1.1.x/) - Backend web framework
- [SunPy](https://sunpy.org/) / [AstroPy](https://www.astropy.org/) - Library for solar positions
- [Pipenv](https://pipenv-fork.readthedocs.io/en/latest/) - Python versioning / virtual environments

### Infra

- [Docker](https://www.docker.com/) - Containerising the application
- [Kubernetes](https://kubernetes.io/) - Container management
- [Kustomize](https://github.com/kubernetes-sigs/kustomize) - Templating for Kubernetes configuration
- [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine) - Managed Kubernetes platform
- [Google Container Registry](https://cloud.google.com/container-registry) - Container registry
- [GitHub Actions](https://github.com/features/actions) - Build and deploy the Kubernetes containers

## Other

- [mkcert](https://mkcert.org/) - Local certificates for local HTTPS (needed for `deviceorientation`)
- [act](https://github.com/nektos/act) - Running GitHub Actions locally

## TODO
- [ ] Always more UI!
- [ ] Better JS minification (i.e. not Parcel).
- [ ] Explain what "position in the solar-system" actually means.
- [ ] Add some client-side routing for deep linking.
