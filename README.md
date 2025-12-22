<!-- Leave three blank lines between sections -->

README.md
=========

The purpose of this project is to find small ellipses whose arcs can approximate a circular arc that has a massive radius but a relatively short chord length.

Try it: https://davidhu3141.github.io/ArcApproxByEllipse/?lang=en



Motivation
----------

A friend of mine wanted to cut a circular arc with radius `700 cm` and chord length `250 cm` out of a wooden board, but the room was not large enough for a compass of that size. He had previously used an "Archimedean ellipse trammel" to draw ellipses, so I wondered if we could approximate a circular arc with the same kind of tool.

I do not know whether this approach fits real woodworking needs or construction scenarios, but building this project feels like a fun way to explore relationships between ellipses and circles. It may even turn out to be helpful for someone, so I decided to try it.

An Archimedean ellipse trammel means that you drill two nails into a wooden rod (green line below), attach a pen at another point (black dot), and let the nails slide along two perpendicular grooves (red and blue dots). The pen will trace an ellipse. The ellipse semi-major/minor axes are just the distances from the pen to each nail.

The figure below shows the case where the pen is between the two nails.

![](doc_assets/archiT2.gif)

The next figure shows the pen not between the nails. When m is in `0~1`, it becomes the previous case again.

![](doc_assets/archiT3.gif)



Usage / Parameters
------------------

### Arc settings (R, theta or chord, tolerance)

Consider a circular arc with radius R and central angle *theta*. You may specify the chord length instead of the angle.

![](doc_assets/inkscape_jZlxNiIklu.png)

Then set a tolerance. This tool will find an ellipse close to the arc and as small as possible. The ellipse deviates slightly from the arc, but the error stays within the tolerance.

![](doc_assets/inkscape_CQt9wvgW1E.png)

### Endpoints and midpoint

By default, the ellipse endpoints and the midpoint lie on the circular arc. Other points may deviate, with error less than the tolerance.

![](doc_assets/inkscape_Ahd9IypRPN.png)

In advanced settings, you can allow error at the endpoints or midpoint, and the ellipse can become even smaller. This is explained in the advanced settings section.

### Output (the followings are in progress)

Once an ellipse is found, the tool draws it and shows the following values:

- a: semi-major axis
- b: semi-minor axis
- L1: distance from chord to ellipse center
- L2: maximum horizontal travel of the trammel slider
- L3: maximum vertical travel of the trammel slider, i.e. a-b
- t0: the initial angle of the trammel rod

<!-- pic, site gif -->

The tool also plots the error along the ellipse. The horizontal axis represents the angle between the arc point and the x-axis.

![](doc_assets/inkscape_ipfrkGQYYr.png)

So points such as (110, 0.05) or (66, 0.07) in the Error vs Angle chart mean the error values are 0.05 and 0.07 at angles 110 and 66. The chart is shown in decreasing angle order to match the arc visually.

![](doc_assets/inkscape_V1e7fnLjeC.png)

### Advanced settings

Three points can determine at most one ellipse symmetric about the y-axis. I pick the arc midpoint, the right quarter, and the right endpoint, and call them P, Q, R.

<!-- pic -->

Within the tolerance, P, Q, R can have small radial offsets. Different offsets define different ellipses, and the program searches for the ellipse with the smallest major axis.

<!-- pic -->

In advanced settings you can set the sampling steps of P, Q, R. In many scenarios I expect P and R to stay on the arc, so by default only Q is adjustable. Check ... to adjust P and R sampling as well.

<!-- pic -->
<!-- scrshot -->

You can also configure the program to return the ellipse with minimum a+b.



Implementation details (src/lib/search.js)
------------------------------------------

#### solveABC(-), toCanonical(-)

The ellipse we want has three unknowns: semi-major axis a, semi-minor axis b, and center height h, so we can write:

$$\frac{x^2}{a^2}+\frac{(y-h)^2}{b^2}=1$$

This can be expanded to $x^2+Ay^2+By+C=0$. It is easy to convert between the two forms.

![](doc_assets/inkscape_os0r3rGDKa.png)

Since we have three unknowns, we need three non-collinear points to determine the ellipse.

Once we fix three points on the ellipse, substitute them into $x^2+Ay^2+By+C=0$ to get a linear system for A, B, C, then convert to a, b, h. It is possible for the solution to become a hyperbola instead (if B < 0).

![](doc_assets/inkscape_331z8118fu.png)

#### runEllipseSearch(-)

How do we select the three points? We take P, Q, R at the arc midpoint, the point between midpoint and right endpoint, and the right endpoint. Each point can have a radial error (d1, d, d2). By default d1=0, -tolerance <= d <= tolerance, d2=0, so the midpoint and endpoints are fixed on the arc.

If you uncheck advanced setting ..., then the midpoint or endpoint can have error. With relaxed constraints, the ellipse should be smaller.



Results
-------

If we allow an error tolerance of $0.5$ cm, the program reports the following:

- The arc can be approximated with an ellipse whose semi-major axis is `a = 185.4 cm` and semi-minor axis is `b = 43.0 cm`.
- The trammel would sweep a triangular area of dimensions roughly `base x height = 250 cm (the chord) x 185.4 cm (a)`.
    - A traditional compass would require `base x height = 250 cm (the chord) x 700 cm (the radius)`.

<!-- pic -->

These results assume zero error at the midpoint and endpoints of the arc, so the largest error appears near the ends. If we allow some error at the midpoint, we can reduce the required value of `a`.

<!-- pic -->

#### Observations



Other Thoughts
--------------

This program is not designed for the type of ellipse trammel where the pen sits between two nails. That version would occupy more space than the other type and is typically meant for ellipses whose two axes are closer in length (my guess). Honestly, I was just too lazy to support it.
