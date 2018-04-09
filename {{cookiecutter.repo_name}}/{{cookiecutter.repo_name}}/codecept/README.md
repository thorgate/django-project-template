[codecept](https://codecept.io/) tests.


#### Fixtures

All fixtures in `django_fixtures` are loaded before tests are ran.


#### Cleanup

No database cleanup is done between tests, so don't have your tests
depend on a clean state, alternatively clean up in every test.


#### run.sh

The `run.sh` script is responsible for activating the correct
compose files, stop any running containers, delete database, load data
and start the tests.
