require 'foreman_tasks_test_helper'
require 'foreman_tasks_core/otp_manager'

module ForemanTasksCore
  class OtpManagerTest < ActiveSupport::TestCase
    let(:username) { 'myuser' }
    let(:password) { '123456789' }
    let(:base64)   { 'bXl1c2VyOjEyMzQ1Njc4OQ==' }

    it 'generates OTPs using SecureRandom.hex and converts them to strings' do
      otp = 4
      SecureRandom.stubs(:hex).returns(otp)
      OtpManager.generate_otp(username).must_equal otp.to_s
    end

    it 'removes OTP only when correct username and password is provided' do
      otp = OtpManager.generate_otp(username)
      OtpManager.drop_otp('wrong_username', 'wrong_password').must_be :nil?
      OtpManager.drop_otp(username, 'wrong_password').must_be :nil?
      OtpManager.drop_otp('wrong_username', otp).must_be :nil?
      OtpManager.drop_otp(username, otp).must_equal otp
    end

    it 'parses the hash correctly' do
      SecureRandom.stubs(:hex).returns(password)
      OtpManager.expects(:drop_otp).with(username, password.to_s)
      OtpManager.authenticate(base64)
    end

    it 'authenticates correctly' do
      SecureRandom.stubs(:hex).returns(password)
      generated = OtpManager.generate_otp(username)

      OtpManager.authenticate(base64).must_equal generated
    end

    it 'OTPs can be used only once' do
      SecureRandom.stubs(:hex).returns(password)
      generated = OtpManager.generate_otp(username)

      OtpManager.authenticate(base64).must_equal generated
      OtpManager.authenticate(base64).must_be :nil?
    end

    it 'creates token from username and password correctly' do
      OtpManager.tokenize(username, password).must_equal base64
    end

    it 'overwrites old OTP when generating a new one for the same username' do
      old = OtpManager.generate_otp(username)
      new = OtpManager.generate_otp(username)
      OtpManager.drop_otp(username, old).must_be :nil?
      OtpManager.drop_otp(username, new).must_equal new
    end
  end
end
