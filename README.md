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
