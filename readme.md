# title-replacer-action

> Replaces, formats or removes keywords in titles of issues and PRs.


## Examples

Enforce a format for certain words:


```diff
- "monorepo-package" SyntaxError: 🍄 not allowed here
+ `monorepo-package` - SyntaxError: 🍄 not allowed here
```

Auto-fix common misspellings

```diff
- RGBA colours are not supported
+ RGBA colors are not supported
```

Ensure your brand is untarnished by lowercaseness:

```diff
- Lost all files due to steam
+ Lost all files due to Steam
```

You can automatically install a [demo workflow](./workflow/title-replacements.yml) with [ghat](https://github.com/fregante/ghat):

```sh
npx -y ghat fregante/title-replacer-action/workflow
```

> [!NOTE]
> The action only replaces standalone words unless you provide a regex. If you set `patterns: "fix"`, it won't match `fixed` nor `fix-stuff`.

## Usage

```yaml
name: Labeler

on:
  pull_request_target:
    types: [opened, edited]
  issues:
    types: [opened, edited]

jobs:
  Label:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      issues: write
    steps:
      - name: Turn keywords into `keywords`
        uses: fregante/title-replacer-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          patterns: alpha, omega
          replacement: '`$0`'
          trim-wrappers: true

      - name: Turn keywords from file into `keywords`
        uses: fregante/title-replacer-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          patterns-path: source/list.txt
          replacement: '($0)'

      - name: Read list of files in directory, use the extension-less names as patterns
        uses: fregante/title-replacer-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          patterns-path: source/features
          replacement: '[$0]'

      # The action can be used as many times as needed in a single job
      - uses: fregante/title-replacer-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          patterns: |
            alpha
            omega
          replacement: '$0: '

      - uses: fregante/title-replacer-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          patterns: /^fix(es)?/
          replacement: 'fix: '
```

## Inputs

See [action.yml](./action.yml)

## Outputs

See [action.yml](./action.yml)

## Related

- [title-to-labels-action](https://github.com/fregante/title-to-labels-action) - Cleans up the titles of issues and PRs from common opening keywords.
- 🛕 [action-release](https://github.com/fregante/ghatemplates/blob/main/readme.md#action-release) - A workflow to help you release your actions
- [daily-version-action](https://github.com/fregante/daily-version-action) - Creates a new tag using the format Y.M.D, but only if HEAD isn’t already tagged.
- [setup-git-user](https://github.com/fregante/setup-git-user) - GitHub Action that sets git user and email to enable committing
