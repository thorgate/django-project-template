Contributing
------------

Documentation is generated using **Sphinx**. It's generated from the reStructuredText
files in /docs/\*.rst. See the reference for reStructuredText Primer
`here <http://www.sphinx-doc.org/en/master/usage/restructuredtext/basics.html>`_.

.. note::
   PyCharm 2018.2 now has support for reST Preview, although it doesn't
   work well with Docker.


New files should be added to /docs with the **.rst** extension.
Then update the toctree in docs/index.rst.

Run :code:`make docs` to generate html.

Use `autodoc <http://www.sphinx-doc.org/en/master/usage/extensions/autodoc.html>`_ to automatically add documentation from docstring.
