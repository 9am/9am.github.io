module.exports = async ({ github, context, core }) => {
    const query = `query lastIssues($owner: String!, $repo: String!, $num: Int = 100, $after: String) {
      repository(owner:$owner, name:$repo){
        issues(first:$num, after:$after, orderBy:{field:CREATED_AT, direction:DESC}, filterBy:{createdBy:$owner}) {
          pageInfo {
            hasNextPage,
            endCursor
          }
          nodes {
            id,
            title,
            body,
            publishedAt,
            number,
            labels(first:10) {
              nodes {
                name
              }
            }
          }
        }
      }
    }`;
    const variables = {
        owner: context.repo.owner,
        repo: context.repo.repo,
        num: 100,
    }
    const escapeHTML = str => str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
    const stripBody = (nodes = []) => nodes.map(item => ({
        ...item,
        title: escapeHTML(item.title),
        body: item.body.replace(/[\r\n]/g, ''),
    }));
    const fetchAll = async () => {
        let output = [];
        let hasNextPage = true;
        let after = null;
        while (hasNextPage) {
            const { repository: { issues } } = await github.graphql(
                query,
                {...variables, after},
            );
            hasNextPage = issues.pageInfo.hasNextPage;
            after = issues.pageInfo.endCursor;
            output = [...output, ...stripBody(issues.nodes)];
        }
        return output;
    };

    core.info('fetching start:');
    const list = await fetchAll();
    core.info(`fetching end: ${list.length}`);
    return list;
}
