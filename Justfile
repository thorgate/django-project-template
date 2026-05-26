set dotenv-load


@_default:
	just --list


# Run tests, i.e "just test" or "just test --k some_test"
test tag +cmd="":
	pytest -E {{tag}} --maxfail=1 -v {{cmd}}

test-poetry tag +cmd="":
	poetry run pytest -E {{tag}} --maxfail=1 -v {{cmd}}

test-main +cmd="": (test "main" cmd)
