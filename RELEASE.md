# Releasing the plugin

To release the plugin the following steps are required:
1. Checkout the latest master branch
2. Determine what the next version should be
   - We try to follow [semantic versioning (semver)](https://semver.org)
   - Usually we increase the major version only if we bumped the dependency on Foreman
   - For the rest we follow semver
3. Bump the version in the version file - `lib/foreman-tasks/version.rb`
4. Make a commit "Bump version to $version"
5. Place a version tag on the commit with `git tag v$version`
   - Ideally the tag should be signed.
6. Push the commit and the tag to the upstream repository

When the tag is pushed to git, [the release workflow](.github/workflows/release.yml) should get triggered and should build the gem and push it to [rubygems.org](https://rubygems.org/gems/foreman-tasks).

Once the new version lands in rubygems, consider filing a packaging PR on [foreman-packaging](https://github.com/theforeman/foreman-packaging) or triggering it via automation with:
```shell
gh workflow run bump_packages.yml \
  --repo theforeman/foreman-packaging \
  --raw-field package=foreman-tasks
```

### Note on permissions
The steps outlined above require write access to the repository. This is generally controlled by membership in the [@foreman-tasks](https://github.com/orgs/theforeman/teams/foreman-tasks) team. If needed, steps 1-4 can be done even without permissions. In that case, skip step 5, push the changes to your own fork and send us a pull request, asking for a maintainer to perform step 5.

Similar situation applies to the packaging workflow. It can be triggered (and resulting PRs merged) by members of the team. PRs can also be prepared by hand and sent by anyone.
