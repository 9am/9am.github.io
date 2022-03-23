module.exports = ({ github, context, core }) => {
    const paginate = (input = [], size = 10) => {
        const list = [...input];
        const totalCount = list.length;
        return Array
            .from({ length: Math.ceil(list.length / size) })
            .map((_, i) => i)
            .reduce(
                (memo, pageNum) => {
                    const nodes = list.splice(0, size);
                    const [next = {}] = list;
                    return [
                        ...memo,
                        {
                            nodes,
                            totalCount,
                            pageInfo: {
                                hasNextPage: !!next.id,
                                endCursor: next.id,
                                nextPage: pageNum + 1,
                            },
                        }
                    ];
                },
                [],
            );
    };
    const list = JSON.parse(process.env.DATA);
    const { pageSize } = context.payload.inputs;
    core.info(`pagination start: ${list.length}, ${pageSize}`);
    const pages = paginate(list, pageSize);
    core.info(`pagination end: ${pages.length}`);
    return pages;
}
