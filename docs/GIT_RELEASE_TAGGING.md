# Git Release Tagging

Tags are created manually by the maintainer. Do not create or force-update tags automatically.

Current observed state during final release preparation:

```text
local tag v0.1.0: absent
remote tag v0.1.0: absent
remote tag v0.1.0-rc2: present
```

## If `v0.1.0` Does Not Exist

Create an annotated tag:

```sh
git tag -a v0.1.0 -m "Local AI Side Panel v0.1.0"
git push origin v0.1.0
```

## If `v0.1.0` Already Exists

STOP. Do not recreate, delete, or force-update it.

Inspect it first:

```sh
git show v0.1.0
```

If the tag points to the wrong commit, decide on a release correction process explicitly rather than rewriting published history.
