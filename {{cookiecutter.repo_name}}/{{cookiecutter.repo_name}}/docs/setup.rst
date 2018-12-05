Setup
=====

To set up everything automatically use the makefile command:

- :code:`make setup`

This command:

- copies PyCharm project directory
- creates local settings file from local.py.example
- builds Docker images
- sets up database and runs Django migrations
- runs `docker-compose up`


TODO: Any other information required for a proper setup such as management commands for initial data, etc.
