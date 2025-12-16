<!-- Leave three blank lines between sections -->

README.md
=========

The purpose of this project is to find small ellipses whose arcs can approximate a circular arc that has a massive radius but a relatively short chord length.

Try it: https://davidhu3141.github.io/ArcApproxByEllipse/index.html



Motivation
----------

A friend of mine wanted to cut a circular arc with radius `700 cm` and chord length `250 cm` out of a wooden board, but the room was not large enough for a compass of that size. He had previously used an "Archimedean Ellipse Trammel" to draw ellipses, so I wondered if we could approximate the circular arc with the same kind of tool.

I am not sure whether this approach fits real woodworking needs or construction scenarios. Still, building this project feels like a fun way to explore relationships between ellipses and circles. It may even turn out to be helpful for someone.



Usage / Parameters
------------------

### Arc Settings

<!-- pic -->

r
theta
tolerance

### Output

a
b
L1
L2
L3 = a-b

t0

### Advanced Settings




Results
-------

If we allow an error tolerance of $0.5$ cm, the program reports the following:

- The arc can be approximated with an ellipse whose semi-major axis is `a = 185.4 cm` and semi-minor axis is `b = 43.0 cm`.
- The trammel would sweep a triangular area of roughly `base x height = 250 cm (the chord) x 185.4 cm (a)`.
    - A traditional compass would require `base x height = 250 cm (the chord) x 700 cm (the radius)`.

<!-- pic -->

These results assume zero error at the midpoint and endpoints of the arc, so the largest error appears near the ends. If we allow some error at the midpoint, we can reduce the required value of `a`.

<!-- pic -->



Other Thoughts
--------------

This program is not designed for the type of ellipse trammel where the pen sits between two nails. That version would occupy more space than the other type and is typically meant for ellipses whose two axes are closer in length. Honestly, I was just too lazy to support it.
