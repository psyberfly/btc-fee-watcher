#!/bin/bash

# Function to drop all tables in a PostgreSQL database
drop_all_tables() {
    docker exec -i my-postgres psql -U postgres -d btcfee << EOF
    DO \$\$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
    END \$\$;
EOF
}

# Call the function
drop_all_tables
