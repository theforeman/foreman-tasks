require 'foreman_tasks_test_helper'

class DashboardTableFilterTest < ActiveSupport::TestCase
  before do
    ::ForemanTasks::Task.delete_all
  end

  describe ForemanTasks::DashboardTableFilter do
    before do
      @tasks_builder = HistoryTasksBuilder.new
      @scope = ForemanTasks::Task.all
      @tasks_builder.build
    end

    let :subject do
      ForemanTasks::DashboardTableFilter.new(@scope, params)
    end

    let :filtered_scope do
      subject.scope
    end

    describe 'by result' do
      let(:params) { { result: 'warning' } }

      it 'filters' do
        _(filtered_scope.count).must_equal @tasks_builder.distribution['stopped'][:by_result]['warning'][:total]
      end
    end

    describe 'by state' do
      let(:params) { { state: 'running' } }

      it 'filters' do
        _(filtered_scope.count).must_equal @tasks_builder.distribution['running'][:total]
      end
    end

    describe 'recent' do
      let(:params) do
        { state: 'running',
          time_horizon: 'H24',
          time_mode: 'recent' }
      end

      it 'filters' do
        _(filtered_scope.count).must_equal @tasks_builder.distribution['running'][:recent]
      end
    end

    describe 'recent week time horizon' do
      let(:params) do
        { state: 'running',
          time_horizon: 'week',
          time_mode: 'recent' }
      end

      it 'filters' do
        _(filtered_scope.count).must_equal @tasks_builder.distribution['running'][:recent]
      end
    end

    describe 'older' do
      let(:params) do
        { state: 'running',
          time_horizon: 'H24',
          time_mode: 'older' }
      end

      it 'filters' do
        old_tasks_count = @tasks_builder.distribution['running'][:total] -
                          @tasks_builder.distribution['running'][:recent]
        _(filtered_scope.count).must_equal old_tasks_count
      end
    end
  end
end
