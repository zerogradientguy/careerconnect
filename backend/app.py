from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime, timedelta
import uuid
from models import db, User, Profile, Skill, JobPreference, Experience, Education, Job, JobApplication

app = Flask(__name__)
app.config.from_object('config.Config')

# Configure CORS to allow credentials
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Initialize database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user
    new_user = User(
        email=data['email'],
        password=generate_password_hash(data['password']),
        full_name=data['fullName'],
        user_type=data['userType'],
        created_at=datetime.utcnow()
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Create empty profile
    new_profile = Profile(
        user_id=new_user.id,
        created_at=datetime.utcnow()
    )
    
    db.session.add(new_profile)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully', 'userId': new_user.id}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Set session
    session['user_id'] = user.id
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'email': user.email,
            'fullName': user.full_name,
            'userType': user.user_type
        }
    }), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'isAuthenticated': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'fullName': user.full_name,
                    'userType': user.user_type
                }
            }), 200
    
    return jsonify({'isAuthenticated': False}), 200

# Update the get_profile route to handle employer profiles
@app.route('/api/profile', methods=['GET'])
def get_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    profile = Profile.query.filter_by(user_id=user_id).first()

    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    # Check if profile is complete based on user type
    is_profile_complete = False
    
    if user.user_type == 'jobSeeker':
        # Check required fields for job seeker
        is_profile_complete = bool(
            profile.title and 
            profile.phone and 
            profile.location and 
            profile.bio and 
            Skill.query.filter_by(user_id=user_id).first()  # At least one skill
        )
    elif user.user_type == 'employer':
        # Check required fields for employer
        is_profile_complete = bool(
            profile.company_name and 
            profile.industry and 
            profile.company_location and 
            profile.company_description
        )

    if not is_profile_complete:
        return jsonify({'error': 'Profile incomplete'}), 404

    # Common profile data
    profile_data = {
        'fullName': user.full_name,
        'email': user.email,
        'userType': user.user_type
    }

    # Handle job seeker profile
    if user.user_type == 'jobSeeker':
        # Get skills
        skills = [skill.name for skill in Skill.query.filter_by(user_id=user_id).all()]
        
        # Get job preferences
        job_preference = JobPreference.query.filter_by(user_id=user_id).first()
        job_preferences = {}
        
        if job_preference:
            job_preferences = {
                'jobTypes': json.loads(job_preference.job_types) if job_preference.job_types else [],
                'locations': json.loads(job_preference.locations) if job_preference.locations else [],
                'industries': json.loads(job_preference.industries) if job_preference.industries else [],
                'minSalary': job_preference.min_salary,
                'availability': job_preference.availability,
                'remotePreference': job_preference.remote_preference
            }
        
        # Get experience
        experiences = []
        for exp in Experience.query.filter_by(user_id=user_id).order_by(Experience.start_date.desc()).all():
            experiences.append({
                'id': exp.id,
                'title': exp.title,
                'company': exp.company,
                'location': exp.location,
                'startDate': exp.start_date.strftime('%b %Y') if exp.start_date else '',
                'endDate': exp.end_date.strftime('%b %Y') if exp.end_date else 'Present',
                'description': exp.description
            })
        
        # Get education
        education = []
        for edu in Education.query.filter_by(user_id=user_id).order_by(Education.start_date.desc()).all():
            education.append({
                'id': edu.id,
                'degree': edu.degree,
                'institution': edu.institution,
                'location': edu.location,
                'startDate': edu.start_date.strftime('%b %Y') if edu.start_date else '',
                'endDate': edu.end_date.strftime('%b %Y') if edu.end_date else 'Present'
            })
        
        # Add job seeker specific data
        profile_data.update({
            'phone': profile.phone,
            'location': profile.location,
            'title': profile.title,
            'bio': profile.bio,
            'resumeUrl': profile.resume_url,
            'skills': skills,
            'experience': experiences,
            'education': education,
            'jobPreferences': job_preferences
        })

    # Handle employer profile
    elif user.user_type == 'employer':
        # Get job postings
        job_postings = []
        for job in Job.query.filter_by(employer_id=user_id).all():
            job_postings.append(job.to_dict())
        
        # Count total applications
        total_applications = JobApplication.query.join(Job).filter(Job.employer_id == user_id).count()
        
        # Add employer specific data
        profile_data.update({
            'companyName': profile.company_name,
            'industry': profile.industry,
            'companySize': profile.company_size,
            'foundedYear': profile.founded_year,
            'companyWebsite': profile.company_website,
            'companyLocation': profile.company_location,
            'companyDescription': profile.company_description,
            'logoUrl': profile.logo_url,
            'contactName': profile.contact_name,
            'contactTitle': profile.contact_title,
            'contactEmail': profile.contact_email,
            'contactPhone': profile.contact_phone,
            'linkedinUrl': profile.linkedin_url,
            'twitterUrl': profile.twitter_url,
            'facebookUrl': profile.facebook_url,
            'jobPostings': job_postings,
            'totalApplications': total_applications
        })

    return jsonify(profile_data), 200

# Update the update_profile route to handle employer profiles
@app.route('/api/profile', methods=['POST'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    profile = Profile.query.filter_by(user_id=user_id).first()

    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    # Common profile update
    profile.updated_at = datetime.utcnow()

    # Handle job seeker profile update
    if user.user_type == 'jobSeeker':
        # Handle file upload
        resume_file = request.files.get('resume')
        if resume_file:
            filename = secure_filename(f"{uuid.uuid4()}_{resume_file.filename}")
            resume_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            resume_file.save(resume_path)
            profile.resume_url = f"/uploads/{filename}"
        
        # Update profile fields
        profile.title = request.form.get('title', profile.title)
        profile.phone = request.form.get('phone', profile.phone)
        profile.location = request.form.get('location', profile.location)
        profile.bio = request.form.get('bio', profile.bio)
        
        # Update skills
        if 'skills' in request.form:
            # Delete existing skills
            Skill.query.filter_by(user_id=user_id).delete()
            
            # Add new skills
            skills = json.loads(request.form.get('skills'))
            for skill_name in skills:
                new_skill = Skill(
                    user_id=user_id,
                    name=skill_name,
                    created_at=datetime.utcnow()
                )
                db.session.add(new_skill)
        
        # Update job preferences
        job_preference = JobPreference.query.filter_by(user_id=user_id).first()
        
        if not job_preference:
            job_preference = JobPreference(user_id=user_id)
            db.session.add(job_preference)
        
        if 'jobTypes' in request.form:
            job_preference.job_types = request.form.get('jobTypes')
        
        if 'locations' in request.form:
            job_preference.locations = request.form.get('locations')
        
        if 'industries' in request.form:
            job_preference.industries = request.form.get('industries')
        
        if 'minSalary' in request.form:
            job_preference.min_salary = request.form.get('minSalary')
        
        if 'availability' in request.form:
            job_preference.availability = request.form.get('availability')
        
        if 'remotePreference' in request.form:
            job_preference.remote_preference = request.form.get('remotePreference')
        
        job_preference.updated_at = datetime.utcnow()

    # Handle employer profile update
    elif user.user_type == 'employer':
        # Handle logo upload
        logo_file = request.files.get('logo')
        if logo_file:
            filename = secure_filename(f"{uuid.uuid4()}_{logo_file.filename}")
            logo_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            logo_file.save(logo_path)
            profile.logo_url = f"/uploads/{filename}"
        
        # Update company information
        profile.company_name = request.form.get('companyName', profile.company_name)
        profile.industry = request.form.get('industry', profile.industry)
        profile.company_size = request.form.get('companySize', profile.company_size)
        profile.founded_year = request.form.get('foundedYear', profile.founded_year)
        profile.company_website = request.form.get('companyWebsite', profile.company_website)
        profile.company_location = request.form.get('companyLocation', profile.company_location)
        profile.company_description = request.form.get('companyDescription', profile.company_description)
        
        # Update contact information
        profile.contact_name = request.form.get('contactName', profile.contact_name)
        profile.contact_title = request.form.get('contactTitle', profile.contact_title)
        profile.contact_email = request.form.get('contactEmail', profile.contact_email)
        profile.contact_phone = request.form.get('contactPhone', profile.contact_phone)
        
        # Update social media
        profile.linkedin_url = request.form.get('linkedinUrl', profile.linkedin_url)
        profile.twitter_url = request.form.get('twitterUrl', profile.twitter_url)
        profile.facebook_url = request.form.get('facebookUrl', profile.facebook_url)

    db.session.commit()

    return jsonify({'message': 'Profile updated successfully'}), 200

# Job posting routes
@app.route('/api/jobs', methods=['POST'])
def create_job():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    # Check if user is an employer
    if user.user_type != 'employer':
        return jsonify({'error': 'Only employers can post jobs'}), 403
    
    data = request.json
    
    # Create new job
    new_job = Job(
        employer_id=user_id,
        title=data['title'],
        company=data.get('company', user.profile.company_name),
        location=data.get('location', ''),
        type=data.get('type', ''),
        salary=data.get('salary', ''),
        description=data['description'],
        requirements=json.dumps(data.get('requirements', [])),
        responsibilities=json.dumps(data.get('responsibilities', [])),
        benefits=json.dumps(data.get('benefits', [])),
        is_remote=data.get('isRemote', False),
        experience_level=data.get('experienceLevel', ''),
        application_deadline=datetime.fromisoformat(data['applicationDeadline']) if data.get('applicationDeadline') else None,
        application_email=data.get('applicationEmail', ''),
        application_url=data.get('applicationUrl', ''),
        is_active=True,
        is_draft=False,
        created_at=datetime.utcnow()
    )
    
    db.session.add(new_job)
    db.session.commit()
    
    return jsonify({'message': 'Job posted successfully', 'jobId': new_job.id}), 201

@app.route('/api/jobs/employer', methods=['GET'])
def get_employer_jobs():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    # Check if user is an employer
    if user.user_type != 'employer':
        return jsonify({'error': 'Only employers can access this endpoint'}), 403
    
    # Get all jobs posted by the employer
    jobs = Job.query.filter_by(employer_id=user_id).all()
    
    # Convert jobs to dict
    jobs_data = [job.to_dict() for job in jobs]
    
    return jsonify(jobs_data), 200

# Import the matching utilities
from utils.matching import load_model, calculate_match_score, calculate_seeker_to_jobs_scores

# Load the Word2Vec model
word2vec_model = load_model()

@app.route('/api/jobs', methods=['GET'])
def search_jobs():
    # Get query parameters
    search = request.args.get('search', '')
    job_type = request.args.getlist('jobType')
    location = request.args.getlist('location')
    experience_level = request.args.getlist('experienceLevel')
    remote = request.args.get('remote', '').lower() == 'true'
    
    # Build query
    query = Job.query.filter_by(is_active=True)
    
    # Apply filters
    if search:
        query = query.filter(
            (Job.title.ilike(f'%{search}%')) |
            (Job.company.ilike(f'%{search}%')) |
            (Job.description.ilike(f'%{search}%'))
        )
    
    if job_type:
        query = query.filter(Job.type.in_(job_type))
    
    if location:
        location_filters = []
        for loc in location:
            location_filters.append(Job.location.ilike(f'%{loc}%'))
        query = query.filter(db.or_(*location_filters))
    
    if experience_level:
        query = query.filter(Job.experience_level.in_(experience_level))
    
    if remote:
        query = query.filter(Job.is_remote == True)
    
    # Get results
    jobs = query.all()
    
    # Convert to dict
    jobs_data = [job.to_dict() for job in jobs]
    
    # If user is logged in, calculate match scores
    if 'user_id' in session:
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        if user.user_type == 'jobSeeker':
            # Get user's skills
            skills = [skill.name for skill in Skill.query.filter_by(user_id=user_id).all()]
            
            if skills:  # Only calculate scores if user has skills
                # Get job descriptions
                job_descriptions = [job.description for job in jobs]
                
                # Calculate match scores for all jobs at once
                match_scores = calculate_seeker_to_jobs_scores(word2vec_model, skills, job_descriptions)
                
                # Add scores to job data
                for job_data, score in zip(jobs_data, match_scores):
                    job_data['matchScore'] = score
                
                # Sort by match score (highest first)
                jobs_data.sort(key=lambda x: x.get('matchScore', 0), reverse=True)
            else:
                # If no skills, set all scores to None
                for job_data in jobs_data:
                    job_data['matchScore'] = None
        else:
            # For employers or non-logged in users, set scores to None
            for job_data in jobs_data:
                job_data['matchScore'] = None
    
    return jsonify(jobs_data), 200

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Get employer profile
    employer = User.query.get(job.employer_id)
    employer_profile = Profile.query.filter_by(user_id=job.employer_id).first()
    
    # Add employer info to job data
    job_data = job.to_dict()
    job_data.update({
        'companyLogo': employer_profile.logo_url,
        'companyDescription': employer_profile.company_description,
        'companySize': employer_profile.company_size,
        'companyIndustry': employer_profile.industry,
        'companyWebsite': employer_profile.company_website
    })
    
    # If user is logged in, calculate match score with the Word2Vec model
    if 'user_id' in session and word2vec_model:
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        if user.user_type == 'jobSeeker':
            # Get user's skills
            skills = [skill.name for skill in Skill.query.filter_by(user_id=user_id).all()]
            
            # Calculate match score
            match_score = calculate_match_score(word2vec_model, skills, job.description)
            job_data['matchScore'] = match_score
    
    return jsonify(job_data), 200

@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if user is the employer who posted the job
    if job.employer_id != user_id:
        return jsonify({'error': 'You can only edit your own job postings'}), 403
    
    data = request.json
    
    # Update job fields
    job.title = data.get('title', job.title)
    job.company = data.get('company', job.company)
    job.location = data.get('location', job.location)
    job.type = data.get('type', job.type)
    job.salary = data.get('salary', job.salary)
    job.description = data.get('description', job.description)
    job.requirements = json.dumps(data.get('requirements', json.loads(job.requirements) if job.requirements else []))
    job.responsibilities = json.dumps(data.get('responsibilities', json.loads(job.responsibilities) if job.responsibilities else []))
    job.benefits = json.dumps(data.get('benefits', json.loads(job.benefits) if job.benefits else []))
    job.is_remote = data.get('isRemote', job.is_remote)
    job.experience_level = data.get('experienceLevel', job.experience_level)
    job.application_deadline = datetime.fromisoformat(data['applicationDeadline']) if data.get('applicationDeadline') else job.application_deadline
    job.application_email = data.get('applicationEmail', job.application_email)
    job.application_url = data.get('applicationUrl', job.application_url)
    job.is_active = data.get('isActive', job.is_active)
    job.is_draft = data.get('isDraft', job.is_draft)
    job.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'message': 'Job updated successfully'}), 200

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if user is the employer who posted the job
    if job.employer_id != user_id:
        return jsonify({'error': 'You can only delete your own job postings'}), 403
    
    # Delete job applications first
    JobApplication.query.filter_by(job_id=job_id).delete()
    
    # Delete job
    db.session.delete(job)
    db.session.commit()
    
    return jsonify({'message': 'Job deleted successfully'}), 200

@app.route('/api/recommendations/jobs', methods=['GET'])
def get_job_recommendations():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    # Check if user is a job seeker
    if user.user_type != 'jobSeeker':
        return jsonify({'error': 'Only job seekers can access job recommendations'}), 403
    
    # Get user's skills
    skills = [skill.name for skill in Skill.query.filter_by(user_id=user_id).all()]
    
    if not skills:
        return jsonify({'error': 'Please add skills to your profile to get recommendations'}), 400
    
    # Get all active jobs
    jobs = Job.query.filter_by(is_active=True).all()
    
    if not jobs:
        return jsonify([]), 200
    
    # If Word2Vec model is not loaded
    if not word2vec_model:
        # Fallback to random recommendations
        import random
        recommended_jobs = random.sample(jobs, min(5, len(jobs)))
        job_data = [job.to_dict() for job in recommended_jobs]
        for data in job_data:
            data['matchScore'] = random.randint(70, 95)
        return jsonify(job_data), 200
    
    # Calculate match scores for all jobs
    job_scores = []
    for job in jobs:
        score = calculate_match_score(word2vec_model, skills, job.description)
        job_scores.append((job, score))
    
    # Sort by match score (highest first)
    job_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Get top recommendations (limit to 10)
    top_recommendations = job_scores[:10]
    
    # Prepare response data
    recommendations_data = []
    for job, score in top_recommendations:
        job_data = job.to_dict()
        job_data['matchScore'] = score
        recommendations_data.append(job_data)
    
    return jsonify(recommendations_data), 200

@app.route('/api/recommendations/candidates/<int:job_id>', methods=['GET'])
def get_candidate_recommendations(job_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    
    # Get the job
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if user is the employer who posted the job
    if job.employer_id != user_id:
        return jsonify({'error': 'You can only view candidates for your own job postings'}), 403
    
    # Get all job seekers
    job_seekers = User.query.filter_by(user_type='jobSeeker').all()
    
    if not job_seekers:
        return jsonify([]), 200
    
    # If Word2Vec model is not loaded
    if not word2vec_model:
        # Fallback to random recommendations
        import random
        recommended_seekers = random.sample(job_seekers, min(5, len(job_seekers)))
        seeker_data = []
        for seeker in recommended_seekers:
            profile = Profile.query.filter_by(user_id=seeker.id).first()
            seeker_data.append({
                'id': seeker.id,
                'fullName': seeker.full_name,
                'title': profile.title,
                'location': profile.location,
                'skills': [skill.name for skill in Skill.query.filter_by(user_id=seeker.id).all()],
                'matchScore': random.randint(70, 95)
            })
        return jsonify(seeker_data), 200
    
    # Calculate match scores for all job seekers
    seeker_scores = []
    for seeker in job_seekers:
        # Get skills for this seeker
        skills = [skill.name for skill in Skill.query.filter_by(user_id=seeker.id).all()]
        
        if skills:  # Only include seekers with skills
            score = calculate_match_score(word2vec_model, skills, job.description)
            if score > 50:  # Only include seekers with decent match
                seeker_scores.append((seeker, score))
    
    # Sort by match score (highest first)
    seeker_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Get top recommendations (limit to 10)
    top_recommendations = seeker_scores[:10]
    
    # Prepare response data
    recommendations_data = []
    for seeker, score in top_recommendations:
        profile = Profile.query.filter_by(user_id=seeker.id).first()
        recommendations_data.append({
            'id': seeker.id,
            'fullName': seeker.full_name,
            'title': profile.title,
            'location': profile.location,
            'skills': [skill.name for skill in Skill.query.filter_by(user_id=seeker.id).all()],
            'matchScore': score
        })
    
    return jsonify(recommendations_data), 200

@app.route('/api/jobs/<int:job_id>/apply', methods=['POST'])
def apply_for_job(job_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    # Check if user is a job seeker
    if user.user_type != 'jobSeeker':
        return jsonify({'error': 'Only job seekers can apply for jobs'}), 403
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if user has already applied
    existing_application = JobApplication.query.filter_by(job_id=job_id, applicant_id=user_id).first()
    if existing_application:
        return jsonify({'error': 'You have already applied for this job'}), 400
    
    # Handle resume file
    resume_url = user.profile.resume_url
    resume_file = request.files.get('resume')
    if resume_file:
        filename = secure_filename(f"{uuid.uuid4()}_{resume_file.filename}")
        resume_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        resume_file.save(resume_path)
        resume_url = f"/uploads/{filename}"
    
    # Create application
    new_application = JobApplication(
        job_id=job_id,
        applicant_id=user_id,
        resume_url=resume_url,
        cover_letter=request.form.get('coverLetter', ''),
        status='pending',
        created_at=datetime.utcnow()
    )
    
    db.session.add(new_application)
    db.session.commit()
    
    return jsonify({'message': 'Application submitted successfully'}), 201

@app.route('/api/applications', methods=['GET'])
def get_user_applications():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    # Check if user is a job seeker
    if user.user_type != 'jobSeeker':
        return jsonify({'error': 'Only job seekers can access this endpoint'}), 403
    
    # Get all applications submitted by the user
    applications = JobApplication.query.filter_by(applicant_id=user_id).all()
    
    # Prepare response data
    applications_data = []
    for application in applications:
        job = Job.query.get(application.job_id)
        employer = User.query.get(job.employer_id)
        
        application_data = application.to_dict()
        application_data.update({
            'jobTitle': job.title,
            'company': job.company or employer.profile.company_name,
            'location': job.location,
            'jobType': job.type
        })
        
        applications_data.append(application_data)
    
    return jsonify(applications_data), 200

@app.route('/api/jobs/<int:job_id>/applications', methods=['GET'])
def get_job_applications(job_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    
    # Get the job
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if user is the employer who posted the job
    if job.employer_id != user_id:
        return jsonify({'error': 'You can only view applications for your own job postings'}), 403
    
    # Get all applications for this job
    applications = JobApplication.query.filter_by(job_id=job_id).all()
    
    # Prepare response data
    applications_data = []
    for application in applications:
        applicant = User.query.get(application.applicant_id)
        
        application_data = application.to_dict()
        application_data.update({
            'applicantName': applicant.full_name,
            'applicantEmail': applicant.email,
            'applicantPhone': applicant.profile.phone
        })
        
        applications_data.append(application_data)
    
    return jsonify(applications_data), 200

@app.route('/api/applications/<int:application_id>/status', methods=['PUT'])
def update_application_status(application_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    
    # Get the application
    application = JobApplication.query.get(application_id)
    
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    # Get the job
    job = Job.query.get(application.job_id)
    
    # Check if user is the employer who posted the job
    if job.employer_id != user_id:
        return jsonify({'error': 'You can only update applications for your own job postings'}), 403
    
    data = request.json
    
    # Update application status
    application.status = data.get('status', application.status)
    
    # Add feedback if provided
    if 'feedback' in data and data['feedback']:
        application.feedback = data['feedback']
    
    # Update timestamp
    application.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'message': 'Application status updated successfully'}), 200

@app.route('/uploads/<path:filename>')
def download_file(filename):
    """Serve uploaded files"""
    try:
        return send_from_directory(
            app.config['UPLOAD_FOLDER'],
            filename,
            as_attachment=True
        )
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)

