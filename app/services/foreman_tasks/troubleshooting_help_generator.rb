module ForemanTasks
  class TroubleshootingHelpGenerator
    class Link
      attr_accessor :name, :title, :description, :href

      def initialize(name:, title:, description:, href:)
        @name = name
        @title = title
        @description = description
        @href = href
      end

      def to_h(capitalize_title: false)
        title = capitalize_title ? self.title.titlecase : self.title
        { name: name, title: title, description: description, href: href, external: true }
      end
    end

    class Info
      attr_reader :links, :description_lines

      def initialize
        @description_lines = []
        @links = []
      end

      def add_line(line)
        @description_lines << line
      end

      def add_link(link)
        @links << link
      end
    end

    def initialize(action)
      @action = action
      @custom_info = action.troubleshooting_info if action.respond_to?(:troubleshooting_info)
    end

    def generate_html
      # rubocop:disable Rails/OutputSafety
      (description + link_descriptions_html).join('<br/>').html_safe
      # rubocop:enable Rails/OutputSafety
    end

    def generate_text
      (description + link_descriptions_html).join("\n")
    end

    def link_descriptions_html
      links.map do |link|
        link.description % { link: %(<a href="%{href}">%{title}</a>) % link.to_h }
      end
    end

    def description
      ret = generic_info.description_lines
      ret += @custom_info.description_lines if @custom_info
      ret
    end

    def links
      links = generic_info.links
      links += @custom_info.links if @custom_info
      links
    end

    def generic_info
      @generic_info ||= Info.new.tap do |i|
        i.add_line _('A paused task represents a process that has not finished properly. '\
                        'Any task in paused state can lead to potential inconsistency '\
                        'and needs to be resolved.')
        i.add_line _("The recommended approach is to investigate the error messages below and in 'errors' tab, "\
                     'address the primary cause of the issue and resume the task.')
        if (link = troubleshooting_link)
          i.add_link(link)
        end
      end
    end

    def troubleshooting_link(generic_only: false)
      url_template = Setting[:foreman_tasks_troubleshooting_url]
      return if url_template.blank?
      url = url_template % { label: generic_only ? '' : link_anchor, version: SETTINGS[:version].short }
      Link.new(name: :troubleshooting,
               title: _('troubleshooting documentation'),
               description: _('See %{link} for more details on how to resolve the issue'),
               href: url)
    end

    def link_anchor
      @action.label.to_s
    end
  end
end
