class AddImplicitVarcharUuidCast < ActiveRecord::Migration[5.2]
  def up
    if on_postgresql?
      ActiveRecord::Base.connection.execute <<~SQL
        CREATE CAST (varchar AS uuid)
        WITH INOUT
        AS IMPLICIT
      SQL
    end
  end

  def down
    if on_postgresql?
      ActiveRecord::Base.connection.execute <<~SQL
        DROP CAST (varchar AS uuid)
      SQL
    end
  end

  private

  def on_postgresql?
    ActiveRecord::Base.connection.adapter_name == 'PostgreSQL'
  end
end
