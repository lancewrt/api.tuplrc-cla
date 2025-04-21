import { db } from "../config/db.js";
import { mailOptions } from "../email/activationEmail.js";
import { resetEmail } from "../email/resetEmail.js";
import { transporter } from "../mailer/mailer.js";
import { generateToken } from "../utils/generateToken.js";
import { logAuditAction } from "./auditController.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;

// export const getAccounts = (req,res)=>{
//     const keyword = req.query.keyword || '';
//     const searchKeyword = `%${keyword}%`;
//     const offset = parseInt(req.query.offset, 10)
//     const params = [searchKeyword, searchKeyword, searchKeyword]
//     const fname = parseInt(req.query.fname)
//     const lname = parseInt(req.query.lname)
//     const uname = parseInt(req.query.uname)
//     const role = parseInt(req.query.role)
//     const status = req.query.status

//     console.log('status', status)
//     console.log('role', role)

//     let orderClauses = "";
    
//     // Handle sorting by fname
//     if (fname) {
//         if (fname == '1') {
//             orderClauses='ORDER BY staffaccount.staff_fname ASC';
//         } else if (fname == '2') {
//             orderClauses='ORDER BY staffaccount.staff_fname DESC';
//         }
//     }
    
//     // Handle sorting by lname
//     if (lname) {
//         if (lname == '1') {
//             orderClauses='ORDER BY staffaccount.staff_lname ASC';
//         } else if (lname == '2') {
//             orderClauses='ORDER BY staffaccount.staff_lname DESC';
//         }
//     }

//     // Handle sorting by lname
//     if (uname) {
//         if (uname == '1') {
//             orderClauses='ORDER BY staffaccount.staff_uname ASC';
//         } else if (uname == '2') {
//             orderClauses='ORDER BY staffaccount.staff_uname DESC';
//         }
//     }


//     const whereClauses = [`(staff_fname LIKE ? OR staff_uname LIKE ? OR staff_lname LIKE ?)`]

//     if(role){
//         whereClauses.push(`staffaccount.role_id = '${role}'`)
//     }
//     if(status){
//         whereClauses.push(`staffaccount.staff_status = '${status}'`)
//     }

//     const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
//     const q = `
//         SELECT 
//             staffaccount.staff_id, 
//             staffaccount.staff_uname, 
//             staffaccount.staff_lname, 
//             staffaccount.staff_fname,
//             staffaccount.staff_status,
//             roles.role_name
//         FROM staffaccount
//         JOIN roles ON staffaccount.role_id = roles.role_id
//         ${whereClause}
//         ${orderClauses}
//         LIMIT 5 OFFSET ?`
    
//     const countQ = `
//         SELECT COUNT(DISTINCT staff_id) as total
//         FROM staffaccount
//         ${whereClause}`

//     console.log(q)
    
//     db.query(countQ, params, (err,countResult)=>{
//         if (err) {
//             console.error(err);
//             return res.status(500).send({ error: 'Database query failed' });
//         }

//         const totalUsers = countResult[0]?.total || 0;

//         db.query(q, [...params, offset], (err,results)=>{
//             if (err) {
//                 console.error(err);
//                 return res.status(500).send({ error: 'Database query failed' });
//             }

//             res.send({results,totalUsers});
        
//         })
//     })
// }

export const getAccounts = (req,res)=>{
    const q = `
        SELECT 
            staffaccount.staff_id as userId, 
            staffaccount.staff_uname as username, 
            staffaccount.staff_lname as lastName, 
            staffaccount.staff_fname as firstName,
            staffaccount.staff_status as status,
            roles.role_name as role,
            roles.role_id as role_id
        FROM staffaccount
        JOIN roles ON staffaccount.role_id = roles.role_id
        `

    
    db.query(q, (err,results)=>{
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        res.send(results);
    })
}

export const createAccount = (req,res)=>{
    console.log(req.body)
    const username = req.body.username;
    const password = req.body.password;

    //check if user exist 
    const checkQ = `
    SELECT * FROM staffaccount WHERE staff_uname = ? AND staff_fname = ? AND staff_lname = ?`

    const checkValues = [
        req.body.uname,
        req.body.fname,
        req.body.lname
    ]

    db.query(checkQ, checkValues, (err, checkResults)=>{
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        if(checkResults.length>0){
            return res.send({status: 409, message: 'This user already exist. Please create a new one.'})
        }else{
            const q = `
            INSERT INTO staffaccount (staff_uname, staff_fname, staff_lname, staff_password, staff_status, role_id ) 
            VALUES (?, ?, ?, ?, ?, ?)`
            
            bcrypt.hash(password,saltRounds,(err,hash)=>{
                if(err){
                    console.log(err)
                }
                const values = [
                    req.body.uname,
                    req.body.fname,
                    req.body.lname,
                    hash,
                    'active',
                    req.body.role
                ]

                db.query(q, values, (err,results)=>{
                    if (err) {
                        console.error(err);
                        return res.status(500).send({ error: 'Database query failed' });
                    }

                    logAuditAction(username, 'INSERT', 'staffaccount', null, null, JSON.stringify("Added a new user: " + req.body.uname));
                    res.send({status: 201, message:'User Created Successfully'});
                
                })

            })
        }
    })
}

export const viewAccount = (req,res)=>{
    const id = req.params.id;
    const keyword = req.query.keyword || '';

    const q = `
    SELECT 
      sa.staff_id, 
      sa.staff_fname, 
      sa.staff_lname, 
      sa.staff_uname, 
      sa.staff_email, 
      r.role_id,
      r.role_name  
    FROM staffaccount sa
    JOIN roles r ON r.role_id = sa.role_id 
    WHERE staff_id = ?`


    db.query(q,[id], (err,results)=>{
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        res.send(results);
    
    })
}

// export const editAccount = (req, res) => {
//     console.log(req.body);
//     const password = req.body.password;
//     const username = req.body.username;
//     const selectQuery = `
//         SELECT staff_uname, staff_fname, staff_lname, role_id, staff_password 
//         FROM staffaccount 
//         WHERE staff_id = ?`;

//     db.query(selectQuery, [req.body.id], (err, results) => {
//         if (err || results.length === 0) {
//             return res.status(404).json({ error: 'Account not found' });
//         }

//         const oldValue = JSON.stringify(results[0]);

//         // Hash the new password
//         bcrypt.hash(password, saltRounds, (err, hash) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ error: 'Password hashing failed' });
//             }

//             const updateQuery = `
//                 UPDATE  
//                     staffaccount 
//                 SET 
//                     staff_uname = ?,
//                     staff_fname = ?,
//                     staff_lname = ?,
//                     role_id = ?,
//                     staff_password = ?
//                 WHERE 
//                     staff_id = ?`;

//             const values = [
//                 req.body.uname,
//                 req.body.fname,
//                 req.body.lname,
//                 req.body.role,
//                 hash,
//                 req.body.id
//             ];

//             db.query(updateQuery, values, (err, results) => {
//                 if (err) {
//                     console.error(err);
//                     return res.status(500).json({ error: 'Database query failed' });
//                 }

//                 const newValue = JSON.stringify({
//                     staff_uname: req.body.uname,
//                     staff_fname: req.body.fname,
//                     staff_lname: req.body.lname,
//                     role_id: req.body.role,
//                     staff_password: hash,
//                 });

//                 // Log the audit action
//                 logAuditAction(username, 'UPDATE', 'staffaccount', req.body.id, oldValue, JSON.stringify("Edited a user: " + req.body.uname + " with ID: " + req.body.id));
                
//                 res.send({status: 201, message:'User Edited Successfully'});
//                 // res.status(200).json({ message: 'User edited successfully' });
//             });
//         });
//     });
// }

export const editAccount = (req, res) => {
    console.log(req.body);
    const password = req.body.password;
    const username = req.body.username;

    const selectQuery = `
        SELECT staff_uname, staff_fname, staff_lname, role_id, staff_password 
        FROM staffaccount 
        WHERE staff_id = ?`;

    db.query(selectQuery, [req.body.id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const oldValue = JSON.stringify(results[0]);

        // Fix: Removed trailing comma before WHERE
        const updateQuery = `
            UPDATE staffaccount 
            SET 
                staff_uname = ?,
                staff_fname = ?,
                staff_lname = ?,
                role_id = ?
            WHERE 
                staff_id = ?`;

        const values = [
            req.body.uname,
            req.body.fname,
            req.body.lname,
            req.body.role,
            req.body.id
        ];

        db.query(updateQuery, values, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database query failed' });
            }

            // Correct newValue logging
            const newValue = JSON.stringify({
                staff_uname: req.body.uname,
                staff_fname: req.body.fname,
                staff_lname: req.body.lname,
                role_id: req.body.role,
            });

            logAuditAction(
                username, 'UPDATE', 'staffaccount', req.body.id, oldValue,
                JSON.stringify(`Edited a user: ${req.body.uname} with ID: ${req.body.id}`)
            );

            // If password is changed
            if (password.length > 0) {
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Password hashing failed' });
                    }

                    const updatePassword = `
                        UPDATE staffaccount 
                        SET staff_password = ? 
                        WHERE staff_id = ?`;

                    db.query(updatePassword, [hash, req.body.id], (err) => {  // Pass req.body.id
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Database query failed' });
                        }

                        const newPassword = JSON.stringify({ staff_password: hash });

                        logAuditAction(
                            username, 'UPDATE', 'staffaccount', req.body.id, oldValue,
                            JSON.stringify(`Edited a user: ${req.body.uname} with ID: ${req.body.id}`)
                        );

                        return res.status(201).json({ message: 'User Edited Successfully' }); // Return response here
                    });
                });
            } else {
                return res.status(201).json({ message: 'User Edited Successfully' }); // Response for no password change
            }
        });
    });
};

export const activateAccount = (req, res) => {
    const id = req.params.id;
    const username = req.body.uname;

    // Step 1: Retrieve staff_uname from the database
    const selectQuery = `SELECT staff_uname FROM staffaccount WHERE staff_id = ?`;

    db.query(selectQuery, [id], (selectErr, selectResults) => {
        if (selectErr) {
            console.error('Error fetching username:', selectErr);
            return res.status(500).send({ error: 'Failed to retrieve username from database' });
        }

        if (selectResults.length === 0) {
            return res.status(404).send({ error: 'Staff account not found' });
        }

        const staffUname = selectResults[0].staff_uname; // Store the username in a variable

        console.log('Fetched staff username:', staffUname);

        // Step 2: Perform the update
        const updateQuery = `
            UPDATE 
                staffaccount
            SET 
                staff_status = ?
            WHERE 
                staff_id = ?
        `;

        db.query(updateQuery, ['active', id], (updateErr, updateResults) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).send({ error: 'Database query failed' });
            }

            // Log the audit action
            logAuditAction(username, 'UPDATE', 'staffaccount', staffUname, 'inactive', JSON.stringify("Activated a user: " + staffUname));

            res.send({ status: 201, message: 'User Deactivated' });
        });
    });
}

export const deactivateAccount = (req, res) => {
    const id = req.params.id;
    const username = req.body.uname;
    

    // Step 1: Retrieve staff_uname from the database
    const selectQuery = `SELECT staff_uname FROM staffaccount WHERE staff_id = ?`;

    db.query(selectQuery, [id], (selectErr, selectResults) => {
        if (selectErr) {
            console.error('Error fetching username:', selectErr);
            return res.status(500).send({ error: 'Failed to retrieve username from database' });
        }

        if (selectResults.length === 0) {
            return res.status(404).send({ error: 'Staff account not found' });
        }

        const staffUname = selectResults[0].staff_uname; // Store the username in a variable

        console.log('Fetched staff username:', staffUname);

        // Step 2: Perform the update
        const updateQuery = `
            UPDATE 
                staffaccount
            SET 
                staff_status = ?
            WHERE 
                staff_id = ?
        `;

        db.query(updateQuery, ['inactive', id], (updateErr, updateResults) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).send({ error: 'Database query failed' });
            }

            // Log the audit action
            logAuditAction(username, 'UPDATE', 'staffaccount', staffUname, 'active', JSON.stringify("Deactivated a user: " + staffUname));

            res.send({ status: 201, message: 'User Deactivated' });
        });
    });
}

export const resetPassword = (req,res)=>{
  try {
    
      const {email,firstName} = req.body
      console.log(req.params)
      const token = generateToken(email);

      const invValues = [
          email,
          token
      ]

      const query = `
          INSERT INTO passwordreset (email, token) VALUES (?, ?)`;

      db.query(query, invValues, (err, results) => {
          if (err) {
              console.error(err);
              return res.status(500).send({ error: 'Database query failed' });
          }
  
          // // Log the audit action
          // logAuditAction(username, 'UPDATE', 'staffaccount', staffUname, 'active', JSON.stringify("Deactivated a user: " + staffUname));

          const resetLink = `https://admin.tuplrc-cla.com/reset?token=${token}`;

          // Send email
          transporter.sendMail(resetEmail(email,firstName,resetLink), function(err, data) {
              if (err) {
                console.log("Error " + err);
              } else {
                console.log("Email sent successfully");
                return res.status(200).json({ success: true, isSent: true, });
              }
            });
          });
  } catch (error) {
      console.error('Unexpected error in invite endpoint:', error);
      return res.status(500).json({ error: 'Server error' });
  }
}

export const invite = (req,res)=>{
    try {
        const { 
            firstName,
            lastName,
            username,
            role_id,
            email
         } = req.body;
        console.log(req.body)

        const token = generateToken(email);

        const invValues = [
            firstName,
            lastName,
            username,
            role_id,
            email,
            token
        ]

        const query = `
            INSERT INTO invitation (fname, lname, uname, role_id, email, token) VALUES (?, ?, ?, ?, ?, ?)`;

        db.query(query, invValues, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ error: 'Database query failed' });
            }
    
            // // Log the audit action
            // logAuditAction(username, 'UPDATE', 'staffaccount', staffUname, 'active', JSON.stringify("Deactivated a user: " + staffUname));

            const activationLink = `https://admin.tuplrc-cla.com/activate?token=${token}`;

            // Send email
            transporter.sendMail(mailOptions(email,firstName,activationLink), function(err, data) {
                if (err) {
                  console.log("Error " + err);
                } else {
                  console.log("Email sent successfully");
                  return res.status(200).json({ success: true });
                }
              });
            });
    } catch (error) {
        console.error('Unexpected error in invite endpoint:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}

export const verifyToken = async (req, res) => {
  const { token } = req.query;
  console.log('Received token:', token);

  if (!token) return res.status(400).json({ message: 'Token is required.' });

  const query = `SELECT * FROM invitation WHERE token = ? AND is_used = false`;

  db.query(query, [token], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send({ error: 'Database query failed' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid or already used token.' });
    }

    const invitation = results[0];

    try {
      // Verify the token
      jwt.verify(token, process.env.JWT_SECRET);

      // If successful, mark it as used and proceed
      return res.status(200).json({ message: 'Token is valid.', email: invitation.email });
    } catch (error) {
      // Token verification failed or token expired
      console.error("JWT Verification Error:", error.message);
      return res.status(400).json({ message: 'Token expired or invalid.' });
    }
  });
};

export const verifyResetToken = async (req, res) => {
  const { token } = req.query;
  console.log('Received token:', token);

  if (!token) return res.status(400).json({ message: 'Token is required.' });

  const query = `SELECT * FROM passwordreset WHERE token = ? AND is_used = false`;

  db.query(query, [token], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send({ error: 'Database query failed' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid or already used token.' });
    }

    const account = results[0];

    try {
      // Verify the token
      jwt.verify(token, process.env.JWT_SECRET);

      // If successful, mark it as used and proceed
      return res.status(200).json({ message: 'Token is valid.', email: account.email });
    } catch (error) {
      // Token verification failed or token expired
      console.error("JWT Verification Error:", error.message);
      return res.status(400).json({ message: 'Token expired or invalid.' });
    }
  });
};


export const activate = async (req, res) => {
    const { token, password } = req.body;
  
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required.' });
    }
  
    const query = `SELECT * FROM invitation WHERE token = ? AND is_used = false`;
  
    db.query(query, [token], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send({ error: 'Database query failed' });
      }
  
      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid or already used token.' });
      }
  
      const invitation = results[0];
  
      try {
        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET);
  
        try {
          // 1. Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);
  
          const insertValues = [
              invitation.uname,
              invitation.fname,
              invitation.lname,
              hashedPassword,
              invitation.email,
              invitation.role_id
          ]
    
          // 2. Insert the user into the users table
          const insertQuery = `
              INSERT INTO staffaccount (
                  staff_uname, 
                  staff_fname,
                  staff_lname,
                  staff_password,
                  staff_email,
                  role_id) 
              VALUES (?, ?, ?, ?, ?,?)`;
  
          db.query(insertQuery, insertValues, (insertErr) => {
            if (insertErr) {
              console.error('User creation failed:', insertErr);
              return res.status(500).json({ message: 'Failed to create user.' });
            }
    
            // 3. Update the invitation to mark it as used
            const updateQuery = `UPDATE invitation SET is_used = true WHERE inv_id = ?`;
            db.query(updateQuery, [invitation.inv_id], (updateErr) => {
              if (updateErr) {
                console.error('Failed to update invitation:', updateErr);
                return res.status(500).json({ message: 'Failed to update invitation.' });
              }
    
              return res.status(200).json({ message: 'Account activated successfully.' });
            });
          });
        } catch (hashErr) {
          console.error('Password hashing error:', hashErr);
          return res.status(500).json({ message: 'Server error.' });
        }
      } catch (error) {
        // Token verification failed or token expired
        return res.status(400).json({ message: 'Token expired or invalid.' });
      }
    });
  };

  export const recoverAccount = async (req, res) => {
    const { token, password } = req.body;
  
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required.' });
    }
  
    const query = `SELECT * FROM passwordreset WHERE token = ?`;
  
    db.query(query, [token], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send({ error: 'Database query failed' });
      }
  
      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid or already used token.' });
      }
  
      const account = results[0];
  
      try {
        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET);
  
        try {
          // 1. Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);
  
          // 2. Insert the user into the users table
          const insertQuery = `
              UPDATE 
                staffaccount
              SET
                staff_password = ?
              WHERE
                staff_email = ?
              `;
  
          db.query(insertQuery, [hashedPassword,account.email], (insertErr) => {
            if (insertErr) {
              console.error('User creation failed:', insertErr);
              return res.status(500).json({ message: 'Failed to create user.' });
            }
            // 3. Update the invitation to mark it as used
            const updateQuery = `UPDATE passwordreset SET is_used = true WHERE id = ?`;
            db.query(updateQuery, [account.id], (updateErr) => {
              if (updateErr) {
                console.error('Failed to update invitation:', updateErr);
                return res.status(500).json({ message: 'Failed to recover account.' });
              }
    
              return res.status(200).json({ message: 'Account activated successfully.' });
            });
          });
        } catch (hashErr) {
          console.error('Password hashing error:', hashErr);
          return res.status(500).json({ message: 'Server error.' });
        }
      } catch (error) {
        // Token verification failed or token expired
        return res.status(400).json({ message: 'Token expired or invalid.' });
      }
    });
  };

  export const checkEmailIfExist = (req, res) => {
    const { email } = req.query;
    console.log("Checking email:", email);
  
    // Check if the email is already used in the activated users table (staffaccount)
    const q = `SELECT * FROM staffaccount WHERE staff_email = ?`;
    db.query(q, [email], (userErr, userResults) => {
      if (userErr) {
        console.error("User query error:", userErr);
        return res.status(500).json({ error: "Server error" });
      }
  
      if (userResults.length > 0) {
        // Email is already activated, so it's in use
        return res.status(200).json({ error: "Email is already in use" });
      } else {
        // Check the invitation table for this email
        const invitationQuery = `SELECT * FROM invitation WHERE email = ?`;
        db.query(invitationQuery, [email], (invErr, invResults) => {
          if (invErr) {
            console.error("Invitation query error:", invErr);
            return res.status(200).json({ error: "Server error" });
          }
          
          if (invResults.length > 0) {
            const invite = invResults[0];

            try {
              // Verify the token
              jwt.verify(token, process.env.JWT_SECRET);
              if(!invite.is_used){
                return res.status(200).json({ error: "Activation link already sent" });
              }
        
              // If successful, mark it as used and proceed
              return res.status(200).json({ message: 'Token is valid.', email: invitation.email });
            } catch (error) {
              // Token verification failed or token expired
              return res.status(200).json({ valid: true, message: "This email is valid" });
            }
          } else {
            // No invitation exists at all; the email is free to use.
            return res.status(200).json({ valid: true, message: "This email is valid" });
          }
        });
      }
    });
  };
  

  export const deleteInvite = (req,res)=>{
    const {email} = req.query;

    const q = `DELETE FROM invitation WHERE email = ?`

    db.query(q, [email],(err,results)=>{
        if(err) return res.send(err)
        return res.json(results)
    })
  }

  export const checkIfUnameExist =(req,res)=>{
    const {username} = req.query;
    console.log(username)

    const q = `SELECT * FROM staffaccount WHERE staff_uname = ?`

    db.query(q, [username],(err,results)=>{
        if(err) return res.send(err)
        return res.json(results)
    })
  }

  
  export const newLink = (req, res) => {
    const { token } = req.body; 
  
    // check if the token exists
    const q = `SELECT * FROM invitation WHERE token = ?`;
  
    db.query(q, [token], (err, results) => {
      if (err) {
        console.error("New link query error:", err);
        return res.status(500).json({ error: "Server error" });
      }
  
      if (results.length === 0) {
        return res.status(200).json({ error: "Invalid token" });
      }
  
      const invite = results[0];
      const { email, fname } = invite;
  
      // generate a new token and expiration
      const newToken = generateToken(email); 
  
      // update the token and expiration in DB
      const updateQ = `
        UPDATE invitation
        SET token = ?, is_used = 0
        WHERE email = ?
      `;
  
      db.query(updateQ, [newToken, email], (updateErr, updateResults) => {
        if (updateErr) {
          console.error("Token update error:", updateErr);
          return res.status(500).json({ error: "Failed to update token" });
        }
  
        // send new activation email
        const activationLink = `https://admin.tuplrc-cla.com/activate?token=${newToken}`;
  
        transporter.sendMail(
          mailOptions(email, fname, activationLink),
          (mailErr, info) => {
            if (mailErr) {
              console.error("Email error:", mailErr);
              return res.status(500).json({ error: "Failed to send email" });
            } else {
              console.log("Email sent:", info.response);
              return res.status(200).json({ success: true });
            }
          }
        );
      });
    });
  };
  