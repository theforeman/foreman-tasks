require 'base64'
require 'securerandom'

module ForemanTasksCore
  class OtpManager
    class << self
      def generate_otp(username)
        otp = SecureRandom.hex
        passwords[username] = otp.to_s
      end

      def drop_otp(username, password)
        passwords.delete(username) if passwords[username] == password
      end

      def passwords
        @password ||= {}
      end

      def authenticate(hash, expected_user: nil, clear: true)
        plain = Base64.decode64(hash)
        username, otp = plain.split(':', 2)
        if expected_user
          return false unless expected_user == username
        end
        password_matches = passwords[username] == otp
        passwords.delete(username) if clear && password_matches
        password_matches
      end

      def tokenize(username, password)
        Base64.strict_encode64("#{username}:#{password}")
      end
    end
  end
end
