# Encrypted fairness metrics with `fairlearn-fhe`

Companion README for [`fairness-dashboard-encrypted-metrics.ipynb`](./fairness-dashboard-encrypted-metrics.ipynb).
The notebook mirrors the existing
[`fairness-dashboard-loan-allocation.ipynb`](./fairness-dashboard-loan-allocation.ipynb)
walkthrough but computes the per-group rates under **CKKS homomorphic
encryption** via [`fairlearn-fhe`](https://pypi.org/project/fairlearn-fhe/)
(Apache-2.0). The drop-in replacement keeps the Fairlearn API surface;
only the import line changes:

```python
# plaintext (status quo)
from fairlearn.metrics import demographic_parity_difference

# encrypted (one import change)
from fairlearn_fhe.metrics import demographic_parity_difference
```

The encrypted verdicts agree with the plaintext baseline within CKKS
noise tolerance — the notebook asserts `< 1e-3` absolute error and
typically observes errors several orders of magnitude tighter than that
on the default parameter set. The run also produces a tamper-evident
`MetricEnvelope` an auditor can hand to a regulator.

## What it shows

1. Train a logistic-regression baseline on the UCI Adult dataset
   (`fetch_openml(data_id=1590)`), identical setup to the plaintext
   loan-allocation notebook so the two can be cross-checked.
2. Compute three group-fairness metrics in plaintext:
   - `demographic_parity_difference`
   - `equalized_odds_difference`
   - `equal_opportunity_difference`
3. Encrypt the predicted labels with a CKKS context and recompute the
   same three metrics through `fairlearn_fhe.metrics`.
4. Assert plaintext vs. encrypted verdicts agree within `TOL = 1e-3`.
5. Build a JSON-serialisable `MetricEnvelope` via `audit_metric` —
   parameter-set hash, observed depth, op counts, input hashes, UTC
   timestamp, group counts.
6. (Optional) hand the same `y_pred` to `raiwidgets.FairnessDashboard`
   for interactive exploration.

## Why this is useful

In settings where model predictions are sensitive (regulated industries,
multi-party fairness audits, third-party auditors), it can be necessary
to evaluate fairness without revealing per-row predictions to the auditor.
FHE lets the data owner publish encrypted predictions while still letting
the auditor verify aggregate fairness metrics.

The notebook is intentionally small and self-contained — it is meant as
a starting point, not a production audit pipeline.

## Trust models

`fairlearn-fhe` defines two encryption modes; the notebook runs **Mode A**:

| Mode | Encrypted | Plaintext on auditor side | `trust_model` field |
|------|-----------|---------------------------|---------------------|
| **A** (default) | `y_pred` | `y_true`, `sensitive_features`, group counts | `plaintext_sensitive_features` |
| **B** (full encryption) | `y_pred`, per-row group masks | `y_true`, group counts | `encrypted_sensitive_features` |

Circuit depth depends on the metric, mode, and implementation details
of a given run, and is recorded as `observed_depth` in the envelope.
The number of `rotations` and `ct_pt_muls` likewise scales with the
metric and the sample count — rely on the envelope rather than
assuming fixed depth or operation counts from the README. Mode B is
exposed via `fairlearn_fhe.encrypt_sensitive_features`. See the
upstream [trust-models guide](https://github.com/BAder82t/fairlearn-fhe/blob/main/docs/trust-models.md)
and [threat-model](https://github.com/BAder82t/fairlearn-fhe/blob/main/docs/threat-model.md)
for the cost / privacy tradeoff and what the auditor learns vs does not
learn under each mode.

### Party split when used in practice

The notebook itself runs end-to-end as a single party — that is enough
to demonstrate that the encrypted and plaintext metrics agree, but it
does **not** by itself prove anything about a real two-party deployment.
The intended split is:

| Party       | Sees                                                     | Does                                          |
|-------------|----------------------------------------------------------|-----------------------------------------------|
| Data owner  | Plaintext `y_pred`, secret key, `y_test`, sensitive feature | Trains model, encrypts predictions, holds key |
| Auditor     | Encrypted `y_pred`, public/eval keys, `y_test`, sensitive feature | Computes metrics on ciphertexts               |
| Decryptor   | Final encrypted metric values                            | Decrypts the (small) metric outputs only      |

In this notebook, all three roles collapse to one process. The trust
benefit only materialises when the auditor is a separate party and never
holds the secret key.

What FHE alone does **not** give you here:

- Integrity of the encrypted predictions — there is no zero-knowledge
  proof that ciphertexts match a particular trained model.
- Privacy of ground-truth labels or the sensitive attribute under
  Mode A — both are passed in plaintext.
- Defence against an auditor who can re-run with chosen plaintexts.

If any of those matter for your setting, FHE is one piece of a larger
protocol, not the whole protocol.

## Audit envelope

`audit_metric` packages a verdict with the metadata a regulator needs to
re-verify it without rerunning the FHE circuit:

```python
from fairlearn_fhe import audit_metric

env = audit_metric(
    "demographic_parity_difference",
    y_true=y_test,
    y_pred=y_pred_enc,
    sensitive_features=sf_test,
    ctx=ctx,
    min_group_size=30,  # default is 10; raise for stricter group-size gating
)
env_dict = env.to_dict()
```

The envelope is JSON-serialisable, validates against the published
[JSON Schema](https://github.com/BAder82t/fairlearn-fhe/blob/main/docs/api/envelope.md),
and can be Ed25519-signed for regulator handoff via the Python API
(`pip install fairlearn-fhe[signing]`):

```python
from fairlearn_fhe import sign_envelope, verify_envelope_signature
signed = sign_envelope(env, private_key_pem=...)
```

Verify a signed (or unsigned) envelope from the command line — no FHE
backend required by the verifier:

```bash
fairlearn-fhe verify envelope.json \
  --max-age 86400 \
  --min-security-bits 128 \
  --max-depth 6 \
  --public-key auditor.pub.pem
```

The CLI also exposes `inspect` (human-readable summary), `schema` (print
envelope JSON Schema), and `doctor` (backend availability).

## Handoff to `raiwidgets.FairnessDashboard`

The decrypted per-group rates can flow into the existing dashboard for
interactive exploration; the encrypted verdict is the regulator-facing
artefact, the dashboard is the analyst-facing one. The final notebook
cell shows the (commented-out) handoff:

```python
from raiwidgets import FairnessDashboard
FairnessDashboard(
    sensitive_features=sf_test,
    y_true=y_test,
    y_pred={"baseline": y_pred},
)
```

This README does **not** modify the RAI core or the dashboards; it is
documentation/example code only.

## Requirements

- Python `>=3.10, <3.13` (matches `fairlearn-fhe` 0.2.2)
- `fairlearn>=0.10`
- `scikit-learn>=1.3`, `pandas>=2.0`, `numpy>=1.26`
- `fairlearn-fhe` (Apache-2.0); pulls in `tenseal>=0.3.14` for the
  default CKKS backend
- Optional: `fairlearn-fhe[signing]` for Ed25519 envelope signing,
  `fairlearn-fhe[openfhe]` for the OpenFHE backend
- `raiwidgets` only if you uncomment the dashboard handoff cell

Install:

```bash
pip install "fairlearn-fhe>=0.2.2" "fairlearn>=0.10" scikit-learn pandas

# optional extras
pip install "fairlearn-fhe[signing]"   # sign_envelope/verify_envelope_signature + CLI verify --public-key
pip install "fairlearn-fhe[openfhe]"   # OpenFHE backend
pip install raiwidgets                 # dashboard handoff
```

## Running

From the repo root:

```bash
jupyter notebook notebooks/individual-dashboards/fairness-dashboard/fairness-dashboard-encrypted-metrics.ipynb
```

Or headless:

```bash
jupyter nbconvert --to notebook --execute \
  notebooks/individual-dashboards/fairness-dashboard/fairness-dashboard-encrypted-metrics.ipynb
```

Expected runtime: under one minute on a laptop. The notebook prints both
plaintext and encrypted metric dicts plus the absolute error per metric.

## CKKS parameters

The notebook builds its FHE context with the library default:

```python
ctx = build_context(backend="tenseal")
```

Per the `fairlearn-fhe` docstring, the defaults — `poly_modulus_degree=16384`,
`scale_bits=40`, with the coefficient-modulus chain auto-selected for a
depth-6 fairness-metric circuit — **target 128-bit HE security**.

To override (typical knobs, real signature):

```python
ctx = build_context(
    backend="tenseal",
    poly_modulus_degree=16384,
    scale_bits=40,
    coeff_mod_bit_sizes=[60, 40, 40, 40, 40, 40, 40, 60],  # depth-6 chain
    batch_size=8192,
)
```

Choose `poly_modulus_degree` and `coeff_mod_bit_sizes` consistent with the
HE security level your threat model requires (the
[Homomorphic Encryption Standard](https://homomorphicencryption.org/standard/)
tables are the usual reference) and the circuit depth your metric needs
(`audit_metric` records the actual depth used as `observed_depth` in
the envelope). For OpenFHE the `coeff_mod_bit_sizes` argument is ignored —
OpenFHE chooses the chain itself; pass `batch_size` to control plaintext
slots. See the
[`fairlearn-fhe` README](https://github.com/BAder82t/fairlearn-fhe/blob/main/README.md)
for the full backend surface.

## Sample output

Outputs are stripped from the committed notebook, but a successful run
prints something close to:

```text
# cell: plaintext baseline (dict)
{'demographic_parity_difference': 0.1834...,
 'equalized_odds_difference':     0.1037...,
 'equal_opportunity_difference':  0.0796...}

# cell: encrypted run (dict, recovered after decryption)
{'demographic_parity_difference': 0.1834...,
 'equalized_odds_difference':     0.1037...,
 'equal_opportunity_difference':  0.0796...}

# cell: agreement check (one line per metric)
OK demographic_parity_difference: plain=0.183421 fhe=0.183421 |Δ|=4.21e-08
OK equalized_odds_difference:     plain=0.103712 fhe=0.103712 |Δ|=6.73e-08
OK equal_opportunity_difference:  plain=0.079612 fhe=0.079612 |Δ|=3.14e-08

# cell: audit envelope (selected fields)
{'metric_name': 'demographic_parity_difference',
 'value': 0.1834...,
 'observed_depth': 3,
 'op_counts': {'ct_ct_muls': 0, 'ct_pt_muls': 3, 'ct_scalar_muls': 0,
               'rotations': <int>, 'additions': 0, 'subtractions': 0},
 'n_samples': 14653,
 'n_groups': 2,
 'trust_model': 'plaintext_sensitive_features'}
```

Exact values are seed-dependent (`random_state=12345`) and library-version
dependent. The contract the notebook actually checks is the absolute error
against `TOL = 1e-3`; observed errors are several orders of magnitude
below that.

## Notes & caveats

- The notebook performs a single train / evaluate pass on UCI Adult; it is
  not a robustness or generalisation study.
- CKKS defaults target 128-bit security at depth 6; override the parameters
  if your threat model or circuit depth differs.
- Only the predicted labels are encrypted in this example (Mode A).
  Encrypting the sensitive attribute (Mode B), or computing metrics under
  a multi-key setting, is out of scope.
- `min_group_size=30` in the audit call is stricter than the
  `fairlearn-fhe` default of 10; lower it (or pass 0 to disable) for
  small groups. The warning is informational — the envelope is still
  produced.
- This notebook does **not** modify the RAI core or the dashboards; it is
  documentation/example code only.

## References

- [`fairlearn-fhe` on PyPI](https://pypi.org/project/fairlearn-fhe/)
- [`fairlearn-fhe` GitHub](https://github.com/BAder82t/fairlearn-fhe)
- [Trust-models guide](https://github.com/BAder82t/fairlearn-fhe/blob/main/docs/trust-models.md)
- [Threat model](https://github.com/BAder82t/fairlearn-fhe/blob/main/docs/threat-model.md)
- [Envelope JSON Schema](https://github.com/BAder82t/fairlearn-fhe/blob/main/docs/api/envelope.md)
- [Fairlearn documentation](https://fairlearn.org/)
- [Homomorphic Encryption Standard](https://homomorphicencryption.org/standard/)
- [TenSEAL](https://github.com/OpenMined/TenSEAL) (default CKKS backend)
- [OpenFHE](https://github.com/openfheorg/openfhe-development) (optional backend)
- [UCI Adult dataset](https://archive.ics.uci.edu/dataset/2/adult)
