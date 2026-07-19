# Shape from Shading

**Live demo:** https://hwenchi.github.io/shape-from-shading/

## Rhetorical Design

### Purpose

For a general technical audience, we show — through reconstruction — that
shading encodes 3D geometry. A single image is lossy: depth cannot be uniquely
recovered from one observation alone. The combination of 3D and interactivity
affords two ways to gather the additional observations needed — varying the
viewpoint (structure from motion) and varying the lighting (photometric stereo,
which this demo explores) — and is therefore the right medium when shape is what is being communicated. We use
computer vision as a proxy: the medium is computational, and the algorithms
make the argument demonstrable in a way that a direct account of human visual
perception would not.

### Strategy

Real elevation data (DEM) serves as ground truth. The DEM is rendered under
synthetic lighting; photometric stereo recovers normals from three images at a
time; normals are integrated back to a surface and compared against the
original. Two integration methods — line integral (local, errors compound) and
Frankot-Chellappa (globally optimal, frequency domain) — are shown side by
side. All pipeline stages are displayed simultaneously so the viewer can trace
how depth information flows through each step.

## Technical Challenges

### Frankot-Chellappa integration

Given gradient fields $`p = \partial z/\partial x`$ and $`q = \partial z/\partial y`$,
line integration accumulates errors along paths and is sensitive to noise. The
Frankot-Chellappa algorithm instead finds the surface $`z`$ minimizing the
global integrability error. In the frequency domain the solution at each
frequency $`(u, v)`$ is:

```math
\hat{Z}(u,v) = -\frac{u\,\hat{P}(u,v) + v\,\hat{Q}(u,v)}{u^2 + v^2}
```

where $`\hat{P}`$ and $`\hat{Q}`$ are the 2D DFTs of $`p`$ and $`q`$. The DC
component is set to zero (arbitrary height offset). Applying IFFT yields the
reconstructed surface.

### Normal estimation via reflectance map lookup

For a Lambertian surface under a known light direction, the observed intensity
at each pixel is determined by the dot product of the surface normal and the
light vector. Photometric stereo recovers the normal by comparing three
observed intensities against precomputed reflectance maps. Rather than solving
per pixel (expensive), the three intensities are each quantized to 4 bits,
forming a 12-bit key into a precomputed lookup table that maps directly to the
closest normal — $`O(1)`$ per pixel.