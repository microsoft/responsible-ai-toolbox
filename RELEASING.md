# Releasing Process

## Releasing responsible-ai and raiwidget

1. Find the current version on https://pypi.org
2. On github find the tag with the name matches version number found in step one, take down the name/id of last commit
3. Compare with current main branch and fill CHANGES.md with description of new changes not included in previous deployment.
4. Update version.cfg to next patch version if no new feature added.  
   To next minor version, if new features are added.  
   To update major version, please coordinating with pm and leads.
5. Send the pr and wait for gated pipelines to finish.
6. **Inform the team to block** all other pr to be merged before new version be totally released.
7. Merge pr, then manually run pipeline [release-rai.yml](https://github.com/microsoft/responsible-ai-widgets/actions/workflows/release-rai.yml)
8. Release to pytest first and verify it is working fine
9. Release pypi.com by using "prod" as input env parameter
10. Prod pipeline will also release prod javascript packages to [npm](https://www.npmjs.com/)
11. Go to the releases page: https://github.com/microsoft/responsible-ai-widgets/releases
    Select "Draft a new release"
12. Add in the release notes from CHANGES.md. Select the new release tag that was just created after the deploy. Click publish to publish the new releases
