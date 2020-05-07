import React from 'react';
import PropTypes from 'prop-types';
import { startCase } from 'lodash';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { Button } from 'patternfly-react';
import ForemanModal from 'foremanReact/components/ForemanModal';

export const ConfirmModal = ({
  closeModal,
  actionText,
  actionState,
  action,
  selectedRowsLen,
  id,
}) => (
  <ForemanModal
    title={sprintf(__('%s Selected Tasks'), startCase(actionText))}
    id={id}
  >
    {sprintf(
      __(
        `This will %(action)s %(number)s task(s), putting them in the %(state)s state. Are you sure?`
      ),
      { action: actionText, number: selectedRowsLen, state: actionState }
    )}
    <ForemanModal.Footer>
      <Button onClick={closeModal}>{__('No')}</Button>
      <Button
        bsStyle="primary"
        onClick={() => {
          action();
          closeModal();
        }}
      >
        {__('Yes')}
      </Button>
    </ForemanModal.Footer>
  </ForemanModal>
);

ConfirmModal.propTypes = {
  actionText: PropTypes.string.isRequired,
  actionState: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  selectedRowsLen: PropTypes.number.isRequired,
  action: PropTypes.func,
  id: PropTypes.string.isRequired,
};

ConfirmModal.defaultProps = {
  action: () => null,
};

export default ConfirmModal;
