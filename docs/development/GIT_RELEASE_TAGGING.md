# Git Release Tagging

Tags are created manually by the maintainer. Do not create or force-update tags automatically.

The existing published `v0.1.0` release must remain untouched. Prepare `v0.1.1` as a new patch release tag only after final QA and review pass.

## Before Creating `v0.1.1`

Inspect local and remote tags:

```sh
git tag --list "v0.1.1"
git ls-remote --tags origin "v0.1.1"
```

## If `v0.1.1` Does Not Exist

Create an annotated tag from the reviewed release commit:

```sh
git tag -a v0.1.1 -m "Local AI Side Panel v0.1.1"
git push origin v0.1.1
```

## If `v0.1.1` Already Exists

STOP. Do not recreate, delete, or force-update it.

Inspect it first:

```sh
git show v0.1.1
```

If the tag points to the wrong commit, decide on a release correction process explicitly rather than rewriting published history.
