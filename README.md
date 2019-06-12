# postgraphile-apollo-link-persisted-queries

[Postgraphile](https://www.graphile.org/) cli plugin for [apollo-link-persisted-queries](https://github.com/apollographql/apollo-link-persisted-queries)

Usage:
```
npm install -g postgraphile.apollo-link-persisted-queries
postgraphile --plugins postgraphile.apollo-link-persisted-queries ... --queries-files query.json
```

where `query.json` is generated using [persistgraphql](https://github.com/apollographql/persistgraphql/).
