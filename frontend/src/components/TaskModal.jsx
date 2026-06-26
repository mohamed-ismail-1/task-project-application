import { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSuccess, task }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: ''
      });
    }
  }, [task, isOpen]);

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
