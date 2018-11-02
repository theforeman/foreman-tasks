module ForemanTasksCore
  module SettingsLoader
    def self.settings_registry
      @settings_registry ||= {}
    end

    def self.name_to_settings
      @name_to_settings ||= {}
    end

    def self.settings_keys
      @settings_keys ||= []
    end

    def self.settings_registered?(name)
      name_to_settings.key?(name)
    end

    def self.register_settings(names, object)
      names = [names] unless names.is_a? Array
      names.each do |name|
        raise 'settings name has to be a symbol' unless name.is_a? Symbol
        raise "settings #{name} already registered" if SettingsLoader.settings_registered?(name)

        name_to_settings[name] = object
      end
      settings_registry[names] = object
    end

    def self.setup_settings(name, settings)
      raise "Settings for #{name} were not registered" unless settings_registered?(name)

      name_to_settings[name].initialize_settings(settings)
    end

    def register_settings(names, defaults = {})
      SettingsLoader.register_settings(names, self)
      @defaults = defaults
    end

    def initialize_settings(settings = {})
      @settings = @defaults.merge(settings)
      validate_settings!
    end

    def settings
      raise "Settings for #{self} not initalized" unless @settings

      @settings
    end

    def validate_settings!
      raise 'Only symbols expected in keys' unless @settings.keys.all? { |key| key.is_a? Symbol }
    end
  end
end
