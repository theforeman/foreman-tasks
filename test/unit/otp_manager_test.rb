require 'foreman_tasks_test_helper'
require 'foreman_tasks_core/otp_manager'

module ForemanTasksCore
  class OtpManagerTest < ActiveSupport::TestCase

    class TestOtpManager < OtpManager
      def self.reset!
        @passwords = nil
      end
    end

    before do
      TestOtpManager.reset!
    end

    let(:username) { 'myuser' }
    let(:password) { '123456789' }
    let(:base64)   { 'bXl1c2VyOjEyMzQ1Njc4OQ==' }

    it 'it doesn\'t raise when no passwords were generated yet' do
      assert_nil TestOtpManager.drop_otp('missing', 'password')
    end

    it 'generates OTPs using SecureRandom.hex and converts them to strings' do
      otp = 4
      SecureRandom.stubs(:hex).returns(otp)
      TestOtpManager.generate_otp(username).must_equal otp.to_s
    end

    it 'removes OTP only when correct username and password is provided' do
      otp = TestOtpManager.generate_otp(username)
      assert_nil TestOtpManager.drop_otp('wrong_username', 'wrong_password')
      assert_nil TestOtpManager.drop_otp(username, 'wrong_password')
      assert_nil TestOtpManager.drop_otp('wrong_username', otp)
      TestOtpManager.drop_otp(username, otp).must_equal otp
    end

    it 'parses the hash correctly' do
      SecureRandom.stubs(:hex).returns(password)
      TestOtpManager.expects(:drop_otp).with(username, password.to_s)
      TestOtpManager.authenticate(base64)
    end

    it 'authenticates correctly' do
      SecureRandom.stubs(:hex).returns(password)
      generated = TestOtpManager.generate_otp(username)

      TestOtpManager.authenticate(base64).must_equal generated
    end

    it 'OTPs can be used only once' do
      SecureRandom.stubs(:hex).returns(password)
      generated = TestOtpManager.generate_otp(username)

      TestOtpManager.authenticate(base64).must_equal generated
      assert_nil TestOtpManager.authenticate(base64)
    end

    it 'creates token from username and password correctly' do
      TestOtpManager.tokenize(username, password).must_equal base64
    end

    it 'overwrites old OTP when generating a new one for the same username' do
      old = TestOtpManager.generate_otp(username)
      new = TestOtpManager.generate_otp(username)
      assert_nil TestOtpManager.drop_otp(username, old)
      TestOtpManager.drop_otp(username, new).must_equal new
    end
  end
end
