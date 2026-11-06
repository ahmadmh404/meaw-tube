import {
  defaultShouldDehydrateQuery,
  QueryClient,
<<<<<<< HEAD
} from "@tanstack/react-query";

import superjson from "superjson";

=======
} from '@tanstack/react-query';
import superjson from 'superjson';
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
<<<<<<< HEAD
          query.state.status === "pending",
=======
          query.state.status === 'pending',
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
<<<<<<< HEAD
}
=======
}
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
