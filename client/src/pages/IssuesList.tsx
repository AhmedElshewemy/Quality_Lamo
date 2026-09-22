import React from 'react';
const IssuesList: React.FC<{showAll?: boolean}> = ({showAll}) => <div className="p-6"><h1 className="text-2xl font-bold">{showAll ? 'كل المشاكل' : 'مشاكلي'}</h1></div>;
export default IssuesList;
