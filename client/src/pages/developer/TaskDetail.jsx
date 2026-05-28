import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import Input from '../../components/ui/Input';

const mockTasks = {
  '1': { _id: '1', title: 'Implement JWT refresh rotation', priority: 'Critical', status: 'In Progress', desc: 'Secure backend refresh endpoint with HTTPOnly cookies and token rotation schemas.', comments: [{ user: 'Jane Doe', text: 'Ensure rotation locks are implemented.', time: '1 hr ago' }] },
  '2': { _id: '2', title: 'OAuth2 integration', priority: 'Critical', status: 'Pending', desc: 'Integrate Google authentication strategy on backend modules.', comments: [] },
};

export const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = mockTasks[id] || { title: 'Unknown Task', priority: 'Low', status: 'Pending', desc: 'N/A', comments: [] };

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(task.comments);

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText) return;

    setComments([...comments, { user: 'You (Developer)', text: commentText, time: 'Just now' }]);
    setCommentText('');
  };

  const handleUpdate = () => {
    alert('Task status submitted for lead review.');
    navigate('/developer/tasks');
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader 
        title={task.title} 
        description="Detailed view mapping requirements, attachments, and discussions comments."
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate('/developer/tasks')} variant="secondary" size="sm">
              Back to Tasks
            </Button>
            {task.status !== 'Submitted' && (
              <Button onClick={handleUpdate} variant="primary" size="sm">
                Submit for Review
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-white/5 md:col-span-2 flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 Outfit uppercase">Task Description</h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">{task.desc}</p>
          </div>

          {/* Comments section */}
          <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-slate-400 Outfit uppercase">Discussion Comments</h4>
            
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar mt-1">
              {comments.length > 0 ? (
                comments.map((c, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/40 border border-white/5 rounded-lg flex flex-col gap-1 text-[11px]">
                    <div className="flex justify-between items-center font-bold text-slate-200">
                      <span>{c.user}</span>
                      <span className="text-[9px] text-slate-500">{c.time}</span>
                    </div>
                    <p className="text-slate-350">{c.text}</p>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500">No comments posted yet.</span>
              )}
            </div>

            <form onSubmit={handleComment} className="flex gap-2 mt-2">
              <Input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
              <Button type="submit" variant="secondary" size="sm" className="h-fit self-end py-2">
                Post
              </Button>
            </form>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 h-fit flex flex-col gap-4">
          <h4 className="text-xs font-semibold text-slate-400 Outfit uppercase">Task Metadata</h4>
          
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Priority Badge:</span>
              <PriorityBadge priority={task.priority} />
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <Badge variant="brand">{task.status}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TaskDetail;
