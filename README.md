```Project Structure
[User]
  │
  ├── manages ─────> [Warehouse]
  │                    │
  │                    └── contains ───> [Shelf]
  │                                        ▲
  │                                        │ (sits on)
  ├── performs ────> [Movement]            │
  │                    │                   │
  │                    ├── moves ──> [Inventory] <── (tracks qty)
  │                    │                   │
  │                    └── of ──────> [Product]
  │
  └── uploads ─────> [ImageTask] (AI OCR)
                       │
                       └── generates ──> [Movement] (automatically)

```

### ESLINT

```
Errors → things you definitely want ESLint to complain about.
Warnings → style/quality issues that don't block you.
Auto-fix → rules ESLint can safely fix automatically.
Different configurations → you can decide independently which rules are errors, warnings, or disabled.
Editor integration → see errors/warnings while coding.
CI → optionally make ESLint fail your build later.
```

run the project :

run the redis : redis-server
run the server : npm run dev
run the worker : npm run worker

<!-- Venev for the image rengtion proecss,  -->

install Requirments
it will be called upon the re
