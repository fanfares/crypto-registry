1. No leader when you receive a submission
- Currently this causes a crash due to leader.address on line 253.  What should it do?
- Due to hardcoding forceLeader, I got this immediately.
- - Need to process initial node and wait for leader to be assigned.
- - When leader is assigned, we could then publish received submissions.

2. Submission broadcast failed to inform all the nodes of a received submission.  How do we recover?
- Currently sync service does not sync incomplete submissions, so it stays out of sync.
- - Could sync all submissions via sync service?

3. Leader changes while submission is being processed.
- Could assign leader on submission and send it with broadcast?  

4. Number of nodes changes during submission - causing
- Could send list of responsive nodes with the submission
- Leader could assign list of responsive nodes.
- Could require % of network to confirm rather than all.

5. Sync service interferes with create submission process.
- Theoretical so far.

6. Client receiving timeout because of long time to calculate the initial wallet balance.
- Need to calculate wallet balance in the background and return submission id to the client immediately.
- Cannot assign payment address if there is a possibility of a long wait.

7. Network is forked, and received submissions on both side of fork. 
- Theoretical so far.
