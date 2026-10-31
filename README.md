# AutoVerse Junior — M2 Assembly & Inspection

Interactive desktop-first automobile engineering academy (React 19 + TypeScript + Vite + React Three Fiber). This is an actual real-time 3D application; it does not use still images as a car substitute.

## Requirements

- Node.js 20.19+ or 22.12+
- Modern desktop browser with WebGL2, mouse and keyboard

## Run

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).

## Validate

```bash
npm run test
npm run build
npm run preview
```

## What's implemented

- Real-time orbital 3D EV model created from individually selectable Three.js geometries (chassis, body, motor, battery, tyres/wheels, braking, steering and suspension)
- X-ray body mode, exploded assemblies and mouse-based mesh selection
- Descriptions and system connections for eight components
- Independent motor cutaway laboratory, animated rotor, adjustable speed, pause, knowledge check
- Eight-part workshop with dependency-aware installation, named mount guides, and visible part-by-part assembly
- Remove assemblies with dependent systems; confirmation before removal or full reset
- Vehicle inspection checklist for all eight systems and a saved mission-completion record
- Automatic migration of M1 motor/battery saves, preserving the prepared rolling chassis
- IndexedDB saving and automatic restoration in the same browser
- Responsive desktop garage UI and fourteen tests covering assembly, dependencies, removal, inspection and save migration

## Model and learning boundaries

**Model fidelity:** The bundled car is a detailed, self-contained *procedural engineering visualization*, not a photogrammetric or manufacturer-accurate GLB vehicle. It is made of real selectable 3D meshes (not an image, sprite, or 2D placeholder). To achieve production automotive realism, replace the geometry with properly licensed GLB subassemblies using the identifiers in `src/content/parts.ts` and the model hierarchy in the blueprint. The application functions without external car model downloads.

**Mechanical behavior:** The drivetrain and mounting points are educational approximations. There is no 3D driving, full drivetrain physics, vehicle safety certification, or real-world repair guidance in M1. The motor demonstration animates a simplified rotor and stator rather than solving electromagnetic fields. The assembly action fits parts via validated snap locations rather than physics manipulation.

**Persistence:** Saved to IndexedDB on the user's browser only. Clearing site data removes the saved garage. No account sync or analytics.

## Architecture

- `src/components/CarScene.tsx` — component-based WebGL vehicle and selection
- `src/components/MotorLab.tsx` — independently animated motor cutaway
- `src/content/parts.ts` — eight educational component definitions
- `src/engine/assembly.ts` — installation compatibility rules
- `src/engine/store.ts` — garage and learning state
- `src/storage/db.ts` — IndexedDB versioned storage
- `src/tests/assembly.test.ts` — deterministic assembly validation

## Next release

M2 assembly and inspection use the existing self-contained procedural model. Each assembly has a stable `assembly-<partId>` scene name for a future licensed GLB replacement. Manufacturer-quality GLB assets and the M3 driving simulator remain future work; no external model download is required for this release.
