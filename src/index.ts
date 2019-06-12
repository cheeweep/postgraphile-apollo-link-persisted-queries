import property from "lodash.property";
import { readFileSync } from "fs";
import { PostGraphilePlugin } from "postgraphile";
import { createHash } from "crypto";

const parseQueries = (filesCsv: string) =>
  Object.assign(
    {},
    ...filesCsv
      .split(",")
      .map((f: string) => readFileSync(f, { encoding: "utf8" }))
      .map((s: string) => JSON.parse(s))
  );

const hash = (algo: string, value: string) => {
  const h = createHash(algo);
  h.update(value);
  return h.digest("hex");
};

const hashQueries = (algo: string, queries: Record<string, string>) =>
  Object.assign(
    {},
    ...Object.keys(queries).map(query => ({
      [hash(algo, query)]: query
    }))
  );

const plugin: PostGraphilePlugin = {
  ["cli:flags:add:schema"](addFlag) {
    addFlag(
      "--queries-files <files>",
      "[postgraphile-persisted-queries] Comma seperated list of JSON files containing the persisted queries."
    );
    addFlag(
      "--query-key ['extensions.persistedQuery.sha256Hash']",
      "[postgraphile-persisted-queries] Property path for query document or key."
    );
    addFlag(
      "--query-hash-algo ['sha256']",
      "[postgraphile-persisted-queries] Algorithm used to hash the queries"
    );
    return addFlag;
  },
  ["cli:library:options"](options, { cliOptions }) {
    const {
      queriesFiles = "",
      queryKey = "extensions.persistedQuery.sha256Hash",
      queryHashAlgo = "sha256"
    } = cliOptions;
    return {
      ...options,
      allowedQueries: hashQueries(queryHashAlgo, parseQueries(queriesFiles)),
      getQuery: property(queryKey)
    };
  },
  ["postgraphile:httpParamsList"](list, { options, httpError }) {
    const { allowedQueries = {}, getQuery } = options;
    const queries = list.map<string>(getQuery);
    const allowed = queries.filter(query =>
      allowedQueries.hasOwnProperty(query)
    );
    if (allowed.length !== list.length) {
      throw httpError(400);
    } else {
      return queries.map((query, i) => ({
        ...list[i],
        query: allowedQueries[query]
      }));
    }
  }
};

export default plugin;
