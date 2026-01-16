# no-unnecessary-import

Remove imports that are already auto-imported by `unplugin-auto-import`.

## Rule Details

<!-- eslint-skip -->
```ts
// 👎 bad
import { foo, bar } from 'some-package'

const result = foo()
```

Will be fixed to:

<!-- eslint-skip -->
```ts
// 👍 good
const result = foo()
```

When mixing auto-imported and manual imports:

<!-- eslint-skip -->
```ts
// 👎 bad - 'foo' is auto-imported but 'Baz' is not
import { foo, Baz } from 'some-package'
```

Will be fixed to:

<!-- eslint-skip -->
```ts
// 👍 good - only 'foo' is removed
import { Baz } from 'some-package'
```
