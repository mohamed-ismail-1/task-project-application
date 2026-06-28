import { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Loader2, Plus, X, CheckSquare, Square } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSuccess, task }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '',
    subTasks: []
  });
  const [newSubTask, setNewSubTask] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        subTasks: task.subTasks || []
      });
      setNewSubTask('');
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: '',
        subTasks: []
      });
      setNewSubTask('');
    }
  }, [task, isOpen]);

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    setFormData({
      ...formData,
      subTasks: [...formData.subTasks, { title: newSubTask.trim(), isCompleted: false }]
    });
    setNewSubTask('');
  };

  const handleRemoveSubTask = (index) => {
    const updated = [...formData.subTasks];
    updated.splice(index, 1);
    setFormData({ ...formData, subTasks: updated });
  };

  const handleToggleSubTask = (index) => {
    const updated = [...formData.subTasks];
    updated[index].isCompleted = !updated[index].isCompleted;
    setFormData({ ...formData, subTasks: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const submitData = {
      ...formData,
      dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null
    };
    try {
      if (task) {
        await api.put(`/tasks/${task.id}`, submitData);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', submitData);
        toast.success('Task created');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered contentClassName="glass-card text-white border-0">
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title className="fw-bold">{task ? 'Edit Task' : 'Add New Task'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="text-muted small fw-bold">TITLE</Form.Label>
            <Form.Control
              type="text"
              className="bg-transparent border-secondary text-white"
              placeholder="What needs to be done?"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted small fw-bold">DESCRIPTION</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="bg-transparent border-secondary text-white"
              placeholder="Add some details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label className="text-muted small fw-bold">PRIORITY</Form.Label>
                <Form.Select
                  className="bg-transparent border-secondary text-white"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW" className="bg-dark text-white">Low</option>
                  <option value="MEDIUM" className="bg-dark text-white">Medium</option>
                  <option value="HIGH" className="bg-dark text-white">High</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label className="text-muted small fw-bold">STATUS</Form.Label>
                <Form.Select
                  className="bg-transparent border-secondary text-white"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PENDING" className="bg-dark text-white">Pending</option>
                  <option value="COMPLETED" className="bg-dark text-white">Completed</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted small fw-bold">DUE DATE</Form.Label>
            <Form.Control
              type="date"
              className="bg-transparent border-secondary text-white"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted small fw-bold">SUBTASKS</Form.Label>
            <div className="d-flex gap-2 mb-2">
              <Form.Control
                type="text"
                className="bg-transparent border-secondary text-white"
                placeholder="Add a subtask..."
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubTask();
                  }
                }}
              />
              <Button variant="outline-primary" onClick={handleAddSubTask}>
                <Plus size={20} />
              </Button>
            </div>
            <div className="d-flex flex-column gap-2 mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {formData.subTasks.map((sub, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between bg-dark bg-opacity-50 p-2 rounded border border-secondary">
                  <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => handleToggleSubTask(idx)}>
                    {sub.isCompleted ? <CheckSquare size={18} className="text-success" /> : <Square size={18} className="text-muted" />}
                    <span className={sub.isCompleted ? 'text-decoration-line-through text-muted' : ''}>{sub.title}</span>
                  </div>
                  <Button variant="link" className="text-danger p-0" onClick={() => handleRemoveSubTask(idx)}>
                    <X size={18} />
                  </Button>
                </div>
              ))}
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-secondary p-3">
          <Button variant="outline-secondary" onClick={onClose} className="border-0 text-white">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={18} /> : (task ? 'Update Task' : 'Create Task')}
          </Button>
        </Modal.Footer>
      </Form>
      <style dangerouslySetInnerHTML={{ __html: `
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .form-control:focus, .form-select:focus {
          background: transparent;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          color: white;
        }
      `}} />
    </Modal>
  );
};

export default TaskModal;
