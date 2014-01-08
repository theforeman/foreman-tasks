Foreman Tasks
=============

Tasks management engine for Foreman. Gives you and overview of what's
happening/happened in your Foreman instance.

Installation
------------

Put the following to your Foreman's bundle.d/Gemfile.local.rb:

```ruby
gem 'dynflow', :git => 'git@github.com:iNecas/dynflow.git'
gem 'sinatra' # we use the dynflow web console
gem 'sequel'  # we use the dynflow default Dynflow persistence adapter
gem 'foreman-tasks', :git => 'git@github.com:iNecas/foreman-tasks.git'
```

Run:

```bash
bundle install
rake db:migrate
```

Usage
-----

In the UI, go to `/foreman_tasks/tasks`. This should give a list of
tasks that were run in the system. It's possible to filter that using
scoped search. Possible searches:

```
# search all tasks by user
owner.login = admin
# search all tasks on architecture with id 9
resource_type = Architecture and resource_id = 9
```

Clicking on the action, it should provide more details.

Via API:

```bash
curl -k -u admin:changeme\
  https://foreman.example.com/foreman_tasks/api/tasks/b346db45-76fd-4217-9247-aac51b5cde4e -H 'Accept: application/json'
```

Features
--------

* Current tasks progress
* Audit: tasks history for resources and users
* Possibility to generate CLI examples
* Locking: connection between task and resource: allows listing tasks
  for a resource but also allows preventing to run two
  conflicting tasks on one resource.
* Dynflow integration allowing async processing, workflows definitions etc.


Dynflow Integration
-------------------

This engine is agnostic on background processing tool and can be used
with anything that allows supports some kind of execution hooks.

On the other side, since we started this as part of Katello
integration with Dynflow, the dynflow adapters are already there.

Also, since dynflow has no additional dependencies in terms of another
database (tested mainly on Postgres), this gem ships the Dynflow
setting so that Dynflow can be used directly.

It's turned off by default, but you can turn that on with putting this
code somewhere in Rails initialization process. In case of an engine,
it would be:

```ruby
initializer "your_engine.dynflow_initialize" do |app|
  ForemanTasks.dynflow.require!
end
```

Additionally, there are also examples of using Dynflow for async tasks
and auditing included in this repository. To enable them you just need
to set `FOREMAN_TASKS_MONKEYS` env variable to `true`

```bash
FOREMAN_TASKS_MONKEYS=true bundle exec rails s
```

The example for async tasks handling is the puppet facts import. Next
time puppet imports the facts to Foreman, the task should appear in
the tasks list.

The example for auditing features is the architecture model. On every
modification, there is a corresponding Dynflow action triggered. This
leads to it appearing in the tasks list as well, even there was no
async processing involved, but still using the same interface to
show the task.

The Dynflow console is accessible on `/foreman_tasks/dynflow` path.

## Production mode

In development mode, the Dynflow executor is part of the web server
process. However, in production, it's more than suitable to have the
web server process separated from the async executor. Therefore,
Dynflow is set to use external process in production mode by default
(can be changed with `ForemanTasks.dynflow.config.remote = false`).

The executor process needs to be executed before the web server. You
can run it by:

```ruby
RAILS_ENV=production bundle exec rake foreman_tasks:dynflow:executor
```

Documentation
-------------

TBD - dig into the code for now (happy hacking:)

Tests
-----

TBD

License
-------

MIT

Author
------

Ivan Nečas
