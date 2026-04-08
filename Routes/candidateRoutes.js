const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Candidate = require('../models/candidate');
const { jwtAuthMiddleware } = require('../jwt');


// ================= CHECK ADMIN =================
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user && user.role === 'admin';
    } catch (err) {
        return false;
    }
};


// ================= ADD CANDIDATE =================
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'Only admin can add candidate' });
        }

        const newCandidate = new Candidate(req.body);
        const saved = await newCandidate.save();

        res.status(201).json(saved);

    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});


// ================= UPDATE CANDIDATE =================
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'Only admin can update' });
        }

        const updated = await Candidate.findByIdAndUpdate(
            req.params.candidateID,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.json(updated);

    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});


// ================= DELETE CANDIDATE =================
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'Only admin can delete' });
        }

        const deleted = await Candidate.findByIdAndDelete(req.params.candidateID);

        if (!deleted) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.json({ message: 'Candidate deleted successfully' });

    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});


// ================= VOTE =================
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        const candidateID = req.params.candidateID;
        const userId = req.user.id;

        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin cannot vote' });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: 'You already voted' });
        }

        // Vote update
        candidate.voteCount += 1;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        res.json({ message: 'Vote successful' });

    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});


// ================= GET RESULTS =================
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });

        const results = candidates.map(c => ({
            name: c.name,
            party: c.party,
            voteCount: c.voteCount
        }));

        res.json(results);

    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});


// ================= GET ALL CANDIDATES =================
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party voteCount');
        res.json(candidates);

    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});


module.exports = router;
