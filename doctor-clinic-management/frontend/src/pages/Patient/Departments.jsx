import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input } from '../../components/Forms';
import { departments } from '../../utils/mockData';
import './Departments.css';

const Departments = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = departments.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page departments-page">
      <div className="page-header">
        <h1>Our Departments</h1>
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..." />
      </div>

      <div className="dept-grid">
        {filtered.map((dept) => (
          <div key={dept.id} className="dept-card" style={{ '--dept-color': dept.color }}>
            <div className="dept-icon" style={{ backgroundColor: `${dept.color}20`, color: dept.color }}>
              {dept.icon}
            </div>
            <h3>{dept.name}</h3>
            <p className="dept-desc">{dept.description}</p>
            <p className="dept-doctors">{dept.doctorCount} Doctors</p>
            <Button size="sm" onClick={() => navigate('/patient/doctors', { state: { department: dept.name } })}>View Doctors</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
