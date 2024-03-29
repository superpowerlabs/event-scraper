source .env && docker run -d \
    --name staking-postgres \
    --restart unless-stopped \
    -p 5432:5432 \
    -v $PGDATA:/var/lib/postgresql/data/pgdata \
    -e PGDATA=/var/lib/postgresql/data/pgdata \
    -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    -e POSTGRES_USER=$POSTGRES_USER \
    -e POSTGRES_DB=$POSTGRES_DATABASE \
    postgres:13