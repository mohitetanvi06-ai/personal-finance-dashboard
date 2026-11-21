import { useState, useEffect, useRef } from "react";
import { FaBell, FaPlus, FaCheck, FaCalendarAlt } from "react-icons/fa";
import { reminderAPI } from "../services/api";
import "./NotificationBell.css";

function NotificationBell() {
  const [reminders, setReminders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadReminders = () => {
      reminderAPI
        .getAll()
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setReminders(data);
          }
        })
        .catch((err) => console.warn("Could not load reminders:", err));
    };

    loadReminders();
    const interval = setInterval(loadReminders, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddForm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDismiss = async (id, isCustom) => {
    if (isCustom) {
      try {
        await reminderAPI.dismiss(id);
      } catch (err) {
        console.error("Failed to dismiss reminder:", err);
      }
    }
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddCustom = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setLoading(true);
      const created = await reminderAPI.add({
        title: newTitle.trim(),
        description: newDesc.trim(),
        dueDate: newDueDate || null,
      });
      setReminders((prev) => [
        {
          id: created.id,
          title: created.title,
          description: created.description,
          dueDate: created.dueDate,
          type: "CUSTOM",
          isCustom: true,
        },
        ...prev,
      ]);
      setNewTitle("");
      setNewDesc("");
      setNewDueDate("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add reminder:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyClass = (reminder) => {
    if (reminder.urgency === "high" || reminder.type === "BILL_OVERDUE" || reminder.type === "BUDGET_EXCEEDED") {
      return "high";
    }
    if (reminder.urgency === "medium" || reminder.type === "BILL_DUE" || reminder.type === "BUDGET_WARNING") {
      return "medium";
    }
    return "custom";
  };

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Reminders & Notifications"
        aria-label="Reminders"
      >
        <FaBell size={18} />
        {reminders.length > 0 && (
          <span className="notification-badge">{reminders.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>
              <FaBell size={14} className="text-primary" />
              <span>Reminders ({reminders.length})</span>
            </h4>
            <button
              className="notification-add-btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <FaPlus size={10} style={{ marginRight: "4px" }} />
              {showAddForm ? "Cancel" : "New Reminder"}
            </button>
          </div>

          {showAddForm && (
            <form className="custom-reminder-form" onSubmit={handleAddCustom}>
              <input
                type="text"
                placeholder="Reminder title (e.g. Pay Insurance)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                maxLength={60}
              />
              <input
                type="text"
                placeholder="Note / Amount (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                maxLength={100}
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
              <div className="custom-reminder-form-actions">
                <button
                  type="button"
                  className="btn-reminder-cancel"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-reminder-save" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}

          <div className="notification-list">
            {reminders.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  <FaCheck />
                </div>
                <p>All caught up! No active reminders.</p>
              </div>
            ) : (
              reminders.map((r) => (
                <div key={r.id} className={`notification-item ${getUrgencyClass(r)}`}>
                  <div className="notification-content">
                    <div className="notification-title">{r.title}</div>
                    {r.description && (
                      <p className="notification-desc">{r.description}</p>
                    )}
                    {r.dueDate && (
                      <div className="notification-time">
                        <FaCalendarAlt size={10} style={{ marginRight: "4px" }} />
                        {r.dueDate}
                      </div>
                    )}
                  </div>
                  <button
                    className="notification-dismiss"
                    onClick={() => handleDismiss(r.id, r.isCustom)}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
