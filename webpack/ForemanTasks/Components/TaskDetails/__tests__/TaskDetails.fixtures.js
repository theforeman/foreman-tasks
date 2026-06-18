export const minProps = {
  cancelStep: jest.fn(),
  taskReload: false,
  taskReloadStop: jest.fn(),
  taskReloadStart: jest.fn(),
  taskProgressToggle: jest.fn(),
  apiStatus: 'RESOLVED',
};

/** Props for snapshots that exercise the Execution details tab alongside the overview. */
export const taskDetailsWithExecutionTabDefaults = {
  ...minProps,
  locks: [
    {
      exclusive: false,
      resource_type: 'User',
      resource_id: 4,
      link: null,
    },
  ],
  links: [],
  executionPlan: { state: 'stopped', cancellable: false },
  failedSteps: [],
  runningSteps: [],
  dependsOn: [],
  blocks: [],
  action: 'Refresh foo',
  state: 'stopped',
  result: 'success',
  progress: 100,
  startAt: '',
  startedAt: '',
  endedAt: '',
  startBefore: '',
};

const SAMPLE_FAILED_STEP = {
  error: {
    exception_class: 'RuntimeError',
    message:
      'Action Actions::Katello::EventQueue::Monitor is already active',
    backtrace: [
      "/home/example/gems/dynflow-1.2.3/lib/dynflow/action/singleton.rb:15:in `rescue in singleton_lock!'",
    ],
  },
  action_class: 'Actions::Katello::EventQueue::Monitor',
  state: 'error',
  input:
    '{"locale"=>"en",\n "current_request_id"=>nil,\n "current_user_id"=>4}\n',
  output: '{}\n',
};

const SAMPLE_RUNNING_STEP = {
  cancellable: false,
  id: 1,
  action_class: 'Actions::DynflowExample',
  state: 'running',
  input: '{}',
  output: '{}',
};

const SAMPLE_DEPENDS_ON = [
  {
    id: '123',
    action: 'Actions::FooBar',
    humanized: 'Foo Bar Action',
    state: 'stopped',
    result: 'success',
  },
];

export const fixtureFailedExecutionDetail = {
  ...taskDetailsWithExecutionTabDefaults,
  result: 'error',
  state: 'stopped',
  failedSteps: [SAMPLE_FAILED_STEP],
};

export const fixtureRunningExecutionDetail = {
  ...taskDetailsWithExecutionTabDefaults,
  state: 'running',
  runningSteps: [SAMPLE_RUNNING_STEP],
};

export const fixtureStoppedWithTaskMessages = {
  ...taskDetailsWithExecutionTabDefaults,
  help: '<strong>See logs</strong> for more.',
  output: {
    messages: ['partial output'],
    result: 'error',
    failedModules: {},
  },
  errors: ['Validation failed'],
};

export const fixtureWithDependenciesTables = {
  ...taskDetailsWithExecutionTabDefaults,
  dependsOn: SAMPLE_DEPENDS_ON,
  blocks: [
    {
      id: '789',
      action: 'Actions::Test',
      humanized: 'Test Action',
      state: 'paused',
      result: 'warning',
    },
  ],
};
