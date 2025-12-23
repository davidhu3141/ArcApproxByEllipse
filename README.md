<!-- Leave three blank lines between sections -->

README.md
=========

The purpose of this project is to find small ellipses whose arcs can approximate a circular arc that has a massive radius but a relatively short chord length.

![](doc_assets/arcToolUse.gif)

Try it: https://davidhu3141.github.io/ArcApproxByEllipse/?lang=en

This web tool supports mobile phones (RWD).



Motivation
----------

A friend of mine wanted to cut a circular arc with radius `700 cm` and chord length `250 cm` out of a wooden board, but the room was not large enough for a compass of that size. He had previously used an "Archimedean ellipse trammel" to draw ellipses, so I wondered if we could approximate the circular arc with the same kind of tool.

I do not know whether this approach fits real woodworking needs or construction scenarios, but I think this project is still interesting because it explores relationships between ellipses and circles. It might even be useful for someone, so I decided to try it.

An Archimedean ellipse trammel means that you drill two nails into a wooden rod (green line below), attach a pen at another point (black dot), and let the nails slide along two perpendicular grooves (red and blue dots). The pen will trace an ellipse. The ellipse semi-major/minor axes are just the distances from the pen to each nail.

The figure below shows the case where the pen is between the two nails.

![](doc_assets/archiT2.gif)

The next figure shows the pen not between the nails. When m is in `0~1`, it becomes the previous case again.

![](doc_assets/archiT3.gif)



Usage / Parameters
------------------

### Arc settings (R, theta or chord, tolerance)

Consider a circular arc with radius R and central angle *theta*. You can enter either the central angle or the chord length.

![](doc_assets/inkscape_jZlxNiIklu.png)

Then set a tolerance. This tool will find an ellipse close to the arc and as small as possible. The ellipse deviates slightly from the arc, but the error stays within the tolerance.

![](doc_assets/inkscape_CQt9wvgW1E.png)

A larger tolerance helps find smaller ellipses, but I do not recommend setting tolerance greater than 10% of the radius (e.g. R=700, tolerance=70), because it makes the tool consider unreasonable ellipses and can block reasonable candidates.

### Endpoints and midpoint

By default, the ellipse endpoints and the midpoint lie on the circular arc. Other points may deviate, with error less than the tolerance.

![](doc_assets/inkscape_Ahd9IypRPN.png)

In advanced settings, you can allow error at the endpoints or midpoint, and the ellipse can become even smaller. This is explained in the advanced settings section.

### Output

Once an ellipse is found, the tool draws it and shows the following values:

- a: semi-major axis
- b: semi-minor axis
- L1: distance from chord to ellipse center
- L2: maximum horizontal travel of the trammel slider
- L3: maximum vertical travel of the trammel slider, i.e. a-b
- t0: the initial angle of the trammel rod (relative to x-axis)

![](doc_assets/chrome_result.jpg)

The tool also plots the error along the ellipse. The horizontal axis represents the angle between the arc point and the x-axis.

![](doc_assets/inkscape_ipfrkGQYYr.png)

So points such as (110, 0.05) or (66, 0.07) in the Error vs Angle chart mean the error values are 0.05 and 0.07 at angles 110 and 66. The chart is shown in decreasing angle order to match the arc visually.

![](doc_assets/inkscape_V1e7fnLjeC.png)

### Advanced settings

Three points can determine at most one ellipse symmetric about the y-axis. I pick the arc midpoint, the right quarter, and the right endpoint, and call them P, Q, R. Within the tolerance, Q can have a small radial offset (less than the tolerance). Different offsets define different ellipses, and the program searches for the ellipse with the smallest major axis.

![](doc_assets/inkscape_01QUM5M588.png)

I expect many scenarios to keep P and R on the arc, so by default only Q is adjustable. If you uncheck "Disable P sampling (always on arc)" and "Disable R sampling (always on arc)", you can set the sampling steps for P and R as well.

![](doc_assets/inkscape_tGbwUEWmy9.png)

The "Error sampling steps" option controls how many points are sampled on the ellipse to verify that the error stays within tolerance.

You can also configure the program to return the ellipse with minimum a+b instead of minimum a.

You may also show the "Tried ellipse semi-axes" chart. I originally added it to observe the feasible region of a and b under a given tolerance. Green points are feasible solutions. Gray points represent a, b values computed from P, Q, R combinations that failed, but that does not necessarily mean the a, b values themselves are infeasible, because translating the ellipse might still satisfy the tolerance.

If you uncheck "Skip error checks when the ellipse is already larger than the current smallest", calculations will be slower. This is useful when you want more points in the "Tried ellipse semi-axes" chart to observe the feasible region.



Implementation details (src/lib/search.js)
------------------------------------------

### solveABC(-), toCanonical(-)

The ellipse we want has three unknowns: semi-major axis a, semi-minor axis b, and center height h, so we can write:

$$\frac{x^2}{a^2}+\frac{(y-h)^2}{b^2}=1$$

This can be expanded to $x^2+Ay^2+By+C=0$. It is easy to convert between the two forms.

![](doc_assets/inkscape_os0r3rGDKa.png)

Since we have three unknowns, we need three non-collinear points to determine the ellipse.

Once we fix three points on the ellipse, substitute them into $x^2+Ay^2+By+C=0$ to get a linear system for A, B, C. Solve for A, B, C and then convert to a, b, h. It is possible for the solution to become a hyperbola instead (if B < 0).

![](doc_assets/inkscape_331z8118fu.png)

### runEllipseSearch(-)

P, Q, R can each have a radial error (d1, d, d2). By default P and R sampling are disabled, so d1=d2=0. Once we decide these errors, we can find the ellipse through P, Q, R.

- case 1: skip if the conic is a hyperbola rather than an ellipse
- case 2: skip if the ellipse center is higher than the chord (this happens when tolerance is unreasonably large; the ellipse then touches the chord at its lower edge)
- case 3: skip if the error exceeds the tolerance (even if d1, d, d2 are within tolerance, the arc segment between P-Q or Q-R may exceed it)

In general, increasing tolerance should allow a smaller ellipse. But if the tolerance is set too large (e.g. greater than 10% of the radius), the offset step size also grows, and most sampled ellipses get filtered by case 2, so the search may fail to find an ellipse smaller than the circle. Case 2 is illustrated below:

![](doc_assets/inkscape_8vuHz9RDAB.png)



Other Thoughts
-------------

This program is not designed for the type of ellipse trammel where the pen sits between two nails. That version would occupy more space than the other type and is typically meant for ellipses whose two axes are closer in length (my guess). Honestly, I was just too lazy to support it.

We should be able to observe the feasible region of a and b, but I have not had time yet.
