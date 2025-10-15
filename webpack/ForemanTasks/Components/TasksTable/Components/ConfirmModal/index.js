import { translate as __ } from 'foremanReact/common/I18n';
import { createTaskModal } from './createTaskModal';
import { createBulkTaskModal } from './createBulkTaskModal';
import {
  cancelTask,
  forceCancelTask,
  resumeTask,
} from '../../TasksTableActions';
import {
  bulkCancelBySearch,
  bulkCancelById,
  bulkForceCancelBySearch,
  bulkForceCancelById,
  bulkResumeBySearch,
  bulkResumeById,
} from '../../TasksBulkActions';

export const CancelModal = createTaskModal({
  actionCreator: cancelTask,
  title: __('Cancel Task'),
  messageTemplate: __(
    'This will cancel task "%(taskName)s", putting it in the stopped state. Are you sure?'
  ),
  confirmButtonVariant: 'primary',
  ouiaIdPrefix: 'cancel',
});

export const CancelSelectedModal = createBulkTaskModal({
  bulkActionBySearch: bulkCancelBySearch,
  bulkActionById: bulkCancelById,
  title: __('Cancel Selected Tasks'),
  messageTemplate: __(
    'This will cancel %(number)s task(s), putting them in the stopped state. Are you sure?'
  ),
  confirmButtonVariant: 'primary',
  ouiaIdPrefix: 'cancel-selected',
});

export const ForceUnlockModal = createTaskModal({
  actionCreator: forceCancelTask,
  title: __('Force Unlock Task'),
  messageTemplate: __(
    'This will force unlock task "%(taskName)s". This may cause harm and should be used with caution. Are you sure?'
  ),
  confirmButtonVariant: 'danger',
  ouiaIdPrefix: 'force-unlock',
});

export const ForceUnlockSelectedModal = createBulkTaskModal({
  bulkActionBySearch: bulkForceCancelBySearch,
  bulkActionById: bulkForceCancelById,
  title: __('Force Unlock Selected Tasks'),
  messageTemplate: __(
    'This will force unlock %(number)s task(s). This may cause harm and should be used with caution. Are you sure?'
  ),
  confirmButtonVariant: 'danger',
  ouiaIdPrefix: 'force-unlock-selected',
});

export const ResumeModal = createTaskModal({
  actionCreator: resumeTask,
  title: __('Resume Task'),
  messageTemplate: __(
    'This will resume task "%(taskName)s", putting it in the running state. Are you sure?'
  ),
  confirmButtonVariant: 'primary',
  ouiaIdPrefix: 'resume',
});

export const ResumeSelectedModal = createBulkTaskModal({
  bulkActionBySearch: bulkResumeBySearch,
  bulkActionById: bulkResumeById,
  title: __('Resume Selected Tasks'),
  messageTemplate: __(
    'This will resume %(number)s task(s), putting them in the running state. Are you sure?'
  ),
  confirmButtonVariant: 'primary',
  ouiaIdPrefix: 'resume-selected',
});
