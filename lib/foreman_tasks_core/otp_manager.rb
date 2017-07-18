require 'base64'
require 'securerandom'

module ForemanTasksCore
  class OtpManager
    class << self
      def generate_otp(username)
        otp = SecureRandom.hex
        @passwords ||= {}
        @passwords[username] = otp
      end

      def drop_otp(username, password)
        @passwords.delete(username) if @passwords[username] == password
      end

      def authenticate(hash)
        plain = Base64.decode(hash)
        username, otp = plain.split(':', 2)
        drop_otp(username, otp)
      end

      def tokenize(username, password)
        Base64.strict_encode64("#{username}:#{password}")
      end
    end
  end
end
