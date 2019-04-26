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
        passwords.delete(username)
      end

      def passwords
        @password ||= {}
      end

      def authenticate(hash, clear: true)
        plain = Base64.decode64(hash)
        username, otp = plain.split(':', 2)
        passwords_match = passwords[username] == otp
        drop_otp(username, otp) if clear && passwords_match
        passwords_match
      end

      def tokenize(username, password)
        Base64.strict_encode64("#{username}:#{password}")
      end
    end
  end
end
