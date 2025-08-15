--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-15 16:16:05

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5068 (class 0 OID 73731)
-- Dependencies: 240
-- Data for Name: application_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_logs (id, application_id, changed_by_user_id, changed_by_role, old_status, new_status, action, remarks, "timestamp") FROM stdin;
36	39	9	sse	pending_with_sse	pending_with_safety	approve	All good kindly approve sir.	2025-08-06 15:39:02.357618
37	39	3	safety_officer	pending_with_safety	pending_with_officer1	approve	all documents cleared	2025-08-07 11:41:14.17147
38	39	4	officer1	pending_with_officer1	pending_with_officer2	approve	Approved by OFFICER1 with DSC signature	2025-08-07 12:48:06.678207
39	39	5	officer2	pending_with_officer2	pending_with_chos	approve	generate gatepass	2025-08-07 12:56:32.01917
40	39	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-07 13:39:05.861884
44	41	2	sse	pending_with_sse	pending_with_safety	approve	For Approval please	2025-08-07 15:56:03.909403
45	41	3	safety_officer	pending_with_safety	pending_with_officer1	approve	insurance checked ok	2025-08-07 16:07:45.110955
46	41	8	officer1	pending_with_officer1	pending_with_officer2	approve	ok	2025-08-07 16:08:49.793631
47	41	5	officer2	pending_with_officer2	pending_with_chos	approve	issue gatepass	2025-08-07 16:09:48.097914
48	41	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-07 16:38:40.639917
49	42	2	sse	pending_with_sse	pending_with_safety	approve	checked	2025-08-07 16:46:50.741099
50	42	3	safety_officer	pending_with_safety	pending_with_officer2	approve	insurance are checked.	2025-08-07 16:48:02.249744
51	42	5	officer2	pending_with_officer2	pending_with_chos	approve	issue gatepermit	2025-08-07 16:48:37.061158
52	42	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-07 17:03:04.562266
54	43	2	sse	pending_with_sse	pending_with_safety	approve	All ok kindly check insurance	2025-08-08 08:35:45.287444
55	43	11	safety_officer	pending_with_safety	pending_with_officer2	approve	All Documents ok, For approval sir.	2025-08-08 08:36:50.793391
56	43	5	officer2	pending_with_officer2	pending_with_chos	approve	Issue gate permit	2025-08-08 08:37:33.746915
57	43	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-08 08:37:52.880142
58	38	2	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-08 09:20:38.344458
59	38	11	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-08 09:22:33.7108
60	38	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-08 09:22:57.033032
61	38	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-08 09:23:11.568091
62	4	2	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-08 09:42:33.143314
63	4	3	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-08 09:42:49.82372
64	4	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-08 09:43:02.033671
65	4	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-08 09:44:48.498015
67	44	2	sse	pending_with_sse	pending_with_safety	approve	Checked	2025-08-08 12:00:09.737675
68	44	11	safety_officer	pending_with_safety	pending_with_officer2	approve	documents checked	2025-08-08 12:01:08.808747
69	44	5	officer2	pending_with_officer2	pending_with_chos	approve	issue gate permit	2025-08-08 12:01:47.709044
70	44	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-08 12:02:12.853386
71	3	2	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-08 14:19:49.529729
72	3	11	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-08 14:20:32.015188
73	3	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-08 14:20:55.963232
74	3	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-08 14:21:25.468678
76	45	2	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-08 14:27:41.468981
77	45	11	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-08 14:28:44.678036
78	45	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-08 14:29:23.717254
79	45	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-08 14:30:01.056812
80	2	2	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-08 15:35:24.458649
81	2	11	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-08 15:35:51.739994
82	2	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-08 15:36:33.197382
83	2	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-08 15:37:16.580577
84	1	2	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-08 15:58:52.631346
85	1	3	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-08 15:59:07.647806
86	1	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-08 15:59:19.281638
87	1	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-08 15:59:34.560932
89	46	9	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-08 17:11:42.968616
90	46	3	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-08 17:12:43.735632
91	46	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-08 17:12:57.741443
92	46	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-08 17:13:12.557076
94	47	9	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-11 08:54:13.787605
95	47	3	safety_officer	pending_with_safety	pending_with_safety	modify_period	Gate pass period modified from Tue Aug 12 2025 00:00:00 GMT+0530 (India Standard Time) - Sun Aug 31 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-08-13 - 2025-08-30. Modified by Safety Officer: Safety Officer	2025-08-11 09:12:49.228504
96	47	3	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-11 09:13:03.567759
97	47	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-11 09:13:21.099968
98	47	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-11 09:13:34.543817
100	48	9	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-11 10:41:10.913938
101	48	3	safety_officer	pending_with_safety	pending_with_safety	modify_period	Gate pass period modified from Tue Aug 12 2025 00:00:00 GMT+0530 (India Standard Time) - Sun Aug 31 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-08-13 - 2025-08-30. Modified by Safety Officer: Safety Officer	2025-08-11 10:41:45.326849
102	48	3	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-11 10:41:50.60595
103	48	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-11 10:42:07.69124
104	48	6	chos_npb	pending_with_chos	pending_with_chos	pdf_generated	PDF generated with digital signature	2025-08-11 10:42:19.474869
105	49	\N	contractor	\N	pending_with_sse	create	Application submitted by contractor and assigned to SSE ID: 9	2025-08-11 11:01:57.237195
106	49	9	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-11 11:06:30.284857
107	49	3	safety_officer	pending_with_safety	pending_with_safety	modify_period	Gate pass period modified from Fri Aug 01 2025 00:00:00 GMT+0530 (India Standard Time) - Sun Aug 31 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-08-12 - 2025-08-30. Modified by Safety Officer: Safety Officer	2025-08-11 11:06:51.404846
108	49	3	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-11 11:06:55.395901
110	50	9	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-11 11:31:33.857261
111	50	3	safety_officer	pending_with_safety	pending_with_safety	modify_period	Gate pass period modified from Fri Aug 01 2025 00:00:00 GMT+0530 (India Standard Time) - Sun Aug 31 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-08-12 - 2025-08-30. Modified by Safety Officer: Safety Officer	2025-08-11 11:31:49.827138
112	50	3	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-11 11:31:53.796079
113	50	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-11 11:32:10.155061
114	49	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-11 11:32:15.039613
115	49	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-11 11:32:32.884269
116	50	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-11 11:37:28.522266
117	48	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-11 12:43:41.138395
118	51	\N	contractor	\N	pending_with_sse	create	Application submitted by contractor and assigned to SSE ID: 9	2025-08-11 16:22:24.483958
119	51	9	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-11 16:23:24.698453
120	51	3	safety_officer	pending_with_safety	pending_with_safety	modify_period	Gate pass period modified from Tue Aug 12 2025 00:00:00 GMT+0530 (India Standard Time) - Sun Aug 31 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-08-13 - 2025-08-30. Modified by Safety Officer: Safety Officer	2025-08-11 16:23:59.831831
121	51	3	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-11 16:24:05.168239
122	51	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-11 16:24:28.027655
123	51	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-11 16:43:54.223535
124	52	\N	contractor	\N	pending_with_sse	create	Application submitted by contractor and assigned to SSE ID: 9	2025-08-12 12:19:29.170197
125	53	\N	contractor	\N	pending_with_sse	create	Application submitted by contractor and assigned to SSE ID: 9	2025-08-12 12:24:36.477967
126	52	9	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-12 12:39:23.340522
127	52	3	safety_officer	pending_with_safety	pending_with_officer2	approve	Approved by Safety Officer and forwarded to DY.CME/C	2025-08-12 12:41:34.658619
128	52	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-12 12:42:25.46392
129	52	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-12 12:43:52.316969
130	54	\N	contractor	\N	pending_with_sse	create	Application submitted by contractor and assigned to SSE ID: 9	2025-08-12 16:18:59.018521
131	55	\N	contractor	\N	pending_with_sse	create	Application submitted by contractor and assigned to SSE ID: 9	2025-08-12 16:36:13.648641
132	55	9	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-12 16:40:01.177138
133	55	3	safety_officer	pending_with_safety	pending_with_officer1	approve	Approved by Safety Officer and forwarded to AWM/C	2025-08-12 16:56:18.526021
134	55	4	officer1	pending_with_officer1	pending_with_officer2	approve	Approved by OFFICER1	2025-08-12 16:57:21.453057
135	53	9	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-13 10:42:08.100364
136	53	3	safety_officer	pending_with_safety	pending_with_officer1	approve	Approved by Safety Officer and forwarded to AWM/C	2025-08-13 10:43:02.004821
137	53	4	officer1	pending_with_officer1	pending_with_officer2	approve	Approved by OFFICER1	2025-08-13 10:43:28.924224
138	55	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-13 10:44:04.196812
139	55	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-13 10:44:40.144684
140	55	6	chos_npb	pdf_generated	approved	send_pdf	Gate pass sent to contractor via email and WhatsApp	2025-08-13 12:22:35.251557
141	57	\N	contractor	\N	pending_with_sse	create	Application submitted by contractor and assigned to SSE ID: 9	2025-08-14 15:16:32.619199
142	57	9	sse	pending_with_sse	pending_with_safety	approve	Approved by SSE	2025-08-14 15:17:15.122886
143	57	3	safety_officer	pending_with_safety	pending_with_officer1	approve	Approved by Safety Officer and forwarded to AWM/C	2025-08-14 15:18:33.18089
144	57	4	officer1	pending_with_officer1	pending_with_officer2	approve	Approved by OFFICER1	2025-08-14 15:18:57.092601
145	57	5	officer2	pending_with_officer2	pending_with_chos	approve	Approved by OFFICER2	2025-08-14 15:19:37.292919
146	57	6	chos_npb	pending_with_chos	pdf_generated	generate_pdf	PDF generated with digital signature	2025-08-14 15:20:04.643957
147	57	6	chos_npb	pdf_generated	approved	send_pdf	Gate pass sent to contractor via email and WhatsApp	2025-08-14 15:20:11.51074
\.


--
-- TOC entry 5060 (class 0 OID 41066)
-- Dependencies: 232
-- Data for Name: approval_workflow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.approval_workflow (id, gate_pass_id, approver_role, approver_id, action, remarks, approval_date, digital_signature_used) FROM stdin;
\.


--
-- TOC entry 5054 (class 0 OID 41002)
-- Dependencies: 226
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contracts (id, loa_number, loa_date, work_description, shop_id, firm_id, contractor_name, pan, gst, address, email, phone, contract_period_from, contract_period_to, executing_sse_id, approved_officer_id, created_at, shift_timing) FROM stdin;
1	LOA1234JD98	2025-07-01	Network AMC	2	3	NAME3	DSTG5SD	DFSGDFG	789 Commercial Zone, City, State - 987654	admin@pqr.com	9876543212	2025-06-30	2025-07-30	2	2	2025-07-30 16:05:22.451455	08:00-20:00
7	LOA098536	2025-07-31	Hardware AMC	4	7	RAMESH	GBF65FFD	345678EFDEWFYH0978FG	AYANAVARAM	dummy@gmail.com	9658741230	2025-07-31	2025-08-30	2	1	2025-08-04 12:02:59.324144	08:00-20:00
8	LOA98547	2025-07-31	BIOMETRIC AMC	1	8	Chandrasekar	IUJ548UHT	76HJG6HJ3D	sample address 7/4, sample street, sample nagar, chennai	aakram94@gmail.com	9940356779	2025-07-31	2025-08-30	3	2	2025-08-05 15:07:25.079606	08:00-20:00
11	LOA12344	2025-08-03	LHB AIRBRAKE SYSTEM MAINTANCE	3	8	RAMESH	GBF65FFD	345678EFDEWFYH0978FG	AYANAVARAM	dummy@gmail.com	9658741230	2025-08-05	2025-08-31	9	5	2025-08-06 10:47:24.371902	08:00-20:00
13	LOA/001/01	2025-07-31	Painting of coaching and wagons	2	7	RAMESH	GBF65FFD	345678EFDEWFYH0978FG	AYANAVARAM	dummy@gmail.com	9658741230	2025-07-31	2025-09-29	10	5	2025-08-07 14:34:53.973261	08:00-20:00
12	LOA0005	2025-08-30	Bogie lifting and lowering	2	7	RAMESH	GBF65FFD	345678EFDEWFYH0978FG	AYANAVARAM	dummy@gmail.com	9658741230	2025-07-31	2025-09-29	10	5	2025-08-07 14:18:24.08645	08:00-20:00
14	LOA/25/8/1	2025-08-05	Cleaning contract in Wagon	5	9	Annis kumar	JHY8945U	GST9876543	No.5/8, VOC Street\nSubramanian Nagar	aakram94@gmail.com	9940356779	2025-08-06	2025-12-30	2	8	2025-08-07 14:50:54.44793	08:00-17:00
15	LOA098756437	2025-07-31	role involves maintaining, repairing, and inspecting railway vehicles and associated mechanical systems. This can include locomotives, passenger carriages, freight wagons, and other rolling stock, as well as the machinery and plant within workshops and sheds. 	5	7	RAMESH	GBF65FFD	345678EFDEWFYH0978FG	AYANAVARAM	aakram94@gmail.com	9658741230	2025-08-08	2025-08-30	2	5	2025-08-08 08:32:22.948666	08:00-20:00
16	LOA000567	2025-08-07	Biometric Device maintenance and replacement, weekly device maintenace	3	9	Annis kumar	JHY8945U	GST9876543	No.5/8, VOC Street\nSubramanian Nagar	aakram94@gmail.com	9940356779	2025-07-31	2025-08-30	9	5	2025-08-08 16:03:06.458659	07:00-17:00
17	LOA098765	2025-08-07	pc repair and maintance, network repair and maintance	3	9	Annis kumar	JHY8945U	GST9876543	No.5/8, VOC Street\nSubramanian Nagar	aakram94@gmail.com	9940356779	2025-07-31	2025-08-30	9	5	2025-08-09 12:53:32.179522	08:00-20:00
18	LOA20250812	2025-07-31	A network Annual Maintenance Contract (AMC) is an agreement where a service provider maintains and supports a company's network infrastructure for a fixed annual fee	3	10	Tamil Vasanthan	GBDJ876BG	GST26344734543	No.5, Ambattur high road, Ambattur, Chennai - 600011	tamilvasanthan22@gmail.com	9025760964	2025-07-31	2025-10-30	9	5	2025-08-12 12:15:33.846601	07:00-17:30
\.


--
-- TOC entry 5070 (class 0 OID 73751)
-- Dependencies: 242
-- Data for Name: email_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_notifications (id, application_id, recipient_email, email_type, subject, sent_at, status, error_message, message_id) FROM stdin;
35	38	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by SSE	2025-08-08 09:20:38.34833	pending	\N	\N
36	38	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by SAFETY_OFFICER	2025-08-08 09:22:33.714569	pending	\N	\N
37	38	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by OFFICER2	2025-08-08 09:22:57.036299	pending	\N	\N
38	4	aakram94@gmail.com	approval	Gate Pass Application LOA098536 - Approved by SSE	2025-08-08 09:42:33.147384	pending	\N	\N
39	4	aakram94@gmail.com	approval	Gate Pass Application LOA098536 - Approved by SAFETY_OFFICER	2025-08-08 09:42:49.827063	pending	\N	\N
40	4	aakram94@gmail.com	approval	Gate Pass Application LOA098536 - Approved by OFFICER2	2025-08-08 09:43:02.036536	pending	\N	\N
41	3	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by SSE	2025-08-08 14:19:49.533499	pending	\N	\N
42	3	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by SAFETY_OFFICER	2025-08-08 14:20:32.018697	pending	\N	\N
43	3	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by OFFICER2	2025-08-08 14:20:55.966931	pending	\N	\N
44	2	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by SSE	2025-08-08 15:35:24.462628	pending	\N	\N
45	2	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by SAFETY_OFFICER	2025-08-08 15:35:51.743842	pending	\N	\N
46	2	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by OFFICER2	2025-08-08 15:36:33.200886	pending	\N	\N
47	1	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by SSE	2025-08-08 15:58:52.635362	pending	\N	\N
48	1	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by SAFETY_OFFICER	2025-08-08 15:59:07.650666	pending	\N	\N
49	1	qwerty6i9o@gmail.com	approval	Gate Pass Application LOA1234JD98 - Approved by OFFICER2	2025-08-08 15:59:19.285358	pending	\N	\N
51	47	aakram94@gmail.com	approval	Gate Pass Application LOA098765 - Approved by SSE	2025-08-11 08:54:13.791146	pending	\N	\N
52	47	aakram94@gmail.com	approval	Gate Pass Application LOA098765 - Approved by SAFETY_OFFICER	2025-08-11 09:13:03.571364	pending	\N	\N
53	47	aakram94@gmail.com	approval	Gate Pass Application LOA098765 - Approved by OFFICER2	2025-08-11 09:13:21.102871	pending	\N	\N
55	49	aakram94@gmail.com	application_submitted	Gate Pass Application LOA098765 - Received	2025-08-11 11:01:57.237195	sent	\N	\N
56	49	aakram94@gmail.com	approval	Gate Pass Application LOA098765 - Approved by SSE	2025-08-11 11:06:30.290406	pending	\N	\N
57	49	aakram94@gmail.com	approval	Gate Pass Application LOA098765 - Approved by SAFETY_OFFICER	2025-08-11 11:06:55.400286	pending	\N	\N
58	49	aakram94@gmail.com	approval	Gate Pass Application LOA098765 - Approved by OFFICER2	2025-08-11 11:32:15.040479	pending	\N	\N
59	51	aakram94@gmail.com	application_submitted	Gate Pass Application LOA098765 - Received	2025-08-11 16:22:24.483958	sent	\N	\N
60	51	aakram94@gmail.com	approval	Gate Pass Application LOA098765 - Approved by SSE	2025-08-11 16:23:24.701762	pending	\N	\N
61	51	aakram94@gmail.com	approval	Gate Pass Application LOA098765 - Approved by SAFETY_OFFICER	2025-08-11 16:24:05.173121	pending	\N	\N
62	51	aakram94@gmail.com	approval	Gate Pass Application LOA098765 - Approved by OFFICER2	2025-08-11 16:24:28.031045	pending	\N	\N
67	52	tamilvasathan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by SSE	2025-08-12 12:39:26.838329	sent	\N	<27d9b3d6-31c0-149a-ecc9-bdbd0e82320d@gmail.com>
68	52	safety@railway.gov.in	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-12 12:39:29.32544	sent	\N	<6353d38f-f4c5-5ca9-4582-9d1cbf0a9613@gmail.com>
69	52	tamilvasathan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by SAFETY_OFFICER	2025-08-12 12:41:37.04494	sent	\N	<10fadced-f13b-d597-b214-463ee2f645e3@gmail.com>
70	52	ramesh.dmy@gmail.com	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-12 12:41:38.996301	sent	\N	<f50fd635-e7fd-42d5-2d4a-a91a6a65d313@gmail.com>
71	52	tamilvasathan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by OFFICER2	2025-08-12 12:42:28.256403	sent	\N	<7affe040-1102-265c-9217-0fdffb584f6b@gmail.com>
72	52	npbcwper@gmail.com	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-12 12:42:30.188594	sent	\N	<655b22a3-5115-c5c4-93f8-7c282e86ca57@gmail.com>
75	55	tamilvasathan22@gmail.com	application_submitted	Gate Pass Application LOA20250812 - Received	2025-08-12 16:36:16.688091	sent	\N	<faf1cddc-228a-9510-8752-eedd14b69f11@gmail.com>
76	55	cwperwelfare@gmail.com	new_application_notification	New Gate Pass Application LOA20250812 - Action Required	2025-08-12 16:36:18.703364	sent	\N	<f8fc5f06-0205-750b-4bc3-2961b4a42d5b@gmail.com>
77	55	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by SSE	2025-08-12 16:40:03.482959	sent	\N	<2be7eee5-33cd-da51-ae6e-6105c76627ec@gmail.com>
78	55	safety@railway.gov.in	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-12 16:40:05.554648	sent	\N	<aa63800e-753e-a234-60f1-94b696b58c2a@gmail.com>
79	55	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by SAFETY_OFFICER	2025-08-12 16:56:20.561719	sent	\N	<563d36c6-80db-74e1-cbc8-bc21f54a88c6@gmail.com>
80	55	officer1@railway.gov	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-12 16:56:22.534786	sent	\N	<b9e8a5b0-d199-e5f9-5733-c3c763a16cdc@gmail.com>
81	55	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by OFFICER1	2025-08-12 16:57:24.249723	sent	\N	<603c235d-3011-a4fc-a3ed-6e8905db3435@gmail.com>
82	55	ramesh.dmy@gmail.com	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-12 16:57:26.456417	sent	\N	<964f340e-9d53-061c-d0a9-d7991d34b52d@gmail.com>
83	53	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by SSE	2025-08-13 10:42:11.471174	sent	\N	<511ae211-8d12-1268-23c9-c2277e818f0a@gmail.com>
84	53	safety@railway.gov.in	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-13 10:42:14.145297	sent	\N	<96c2a4b7-1892-2bf4-cd45-f3a649f78e77@gmail.com>
85	53	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by SAFETY_OFFICER	2025-08-13 10:43:04.056516	sent	\N	<fa8a4563-9d8b-d185-a5c6-1761ebe41e61@gmail.com>
86	53	officer1@railway.gov	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-13 10:43:06.080233	sent	\N	<125b56eb-748d-07e7-4726-94ba6b98b7e2@gmail.com>
87	53	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by OFFICER1	2025-08-13 10:43:31.034121	sent	\N	<5a0ff35f-952f-b802-0cc3-10b7d832325a@gmail.com>
88	53	ramesh.dmy@gmail.com	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-13 10:43:33.186355	sent	\N	<ec5d2e77-6074-bc24-55b7-53c4b05539a6@gmail.com>
89	55	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by OFFICER2	2025-08-13 10:44:07.086111	sent	\N	<535231e7-92f5-e7c1-39f6-279efb487ebd@gmail.com>
90	55	npbcwper@gmail.com	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-13 10:44:09.11481	sent	\N	<f1a2c8b5-be94-ddd7-a426-5188a2f6673e@gmail.com>
91	55	tamilvasanthan22@gmail.com	pdf_sent	Gate Pass LOA20250812 - Approved and Ready	2025-08-13 12:22:39.571645	sent	\N	<08e6fef6-c9df-d38d-2593-79408e1d1198@gmail.com>
92	57	tamilvasanthan22@gmail.com	application_submitted	Gate Pass Application LOA20250812 - Received	2025-08-14 15:16:35.514751	sent	\N	<861b335b-993f-edd0-c7b4-d716465cb89d@gmail.com>
93	57	cwperwelfare@gmail.com	new_application_notification	New Gate Pass Application LOA20250812 - Action Required	2025-08-14 15:16:38.533609	sent	\N	<814f371a-f35d-7346-40fc-7316f7e036a9@gmail.com>
94	57	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by SSE	2025-08-14 15:17:17.418039	sent	\N	<32b35f82-8fc8-d38c-2bcb-f4bae78b10d8@gmail.com>
95	57	safety@railway.gov.in	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-14 15:17:19.845305	sent	\N	<8431f91d-1250-75c3-58a1-eaa9e85512f6@gmail.com>
96	57	crissatcwper@gmail.com	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-14 15:17:22.783987	sent	\N	<590b8160-5934-878f-dab2-3cd8b838cff2@gmail.com>
97	57	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by SAFETY_OFFICER	2025-08-14 15:18:35.682791	sent	\N	<6b6761ff-ebc9-3f8f-03a1-937f6ad74423@gmail.com>
98	57	officer1@railway.gov	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-14 15:18:38.067501	sent	\N	<91c272ff-9750-2846-e31e-21e94da014c9@gmail.com>
99	57	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by OFFICER1	2025-08-14 15:18:59.502963	sent	\N	<c2c55121-1a4e-20ab-d807-01e75fbd4815@gmail.com>
100	57	ramesh.dmy@gmail.com	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-14 15:19:01.824306	sent	\N	<1cac9ec8-a79a-24f9-94c7-0626e60f0010@gmail.com>
101	57	tamilvasanthan22@gmail.com	approval	Gate Pass Application LOA20250812 - Approved by OFFICER2	2025-08-14 15:19:39.605724	sent	\N	<3d3071da-2050-d446-9e6b-b8ee9a05097a@gmail.com>
102	57	npbcwper@gmail.com	forwarded_notification	Gate Pass Application LOA20250812 - Forwarded for Your Review	2025-08-14 15:19:42.09009	sent	\N	<4c330ee9-508c-078d-a5c8-cb4646d6988d@gmail.com>
103	57	tamilvasanthan22@gmail.com	pdf_sent	Gate Pass LOA20250812 - Approved and Ready	2025-08-14 15:20:14.279369	sent	\N	<ee5eaac4-aa68-f691-8b20-1836cef5d31f@gmail.com>
\.


--
-- TOC entry 5048 (class 0 OID 40972)
-- Dependencies: 220
-- Data for Name: firms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.firms (id, firm_name, address, contact_person, phone, email, created_at, contractor_name, pan, gst) FROM stdin;
3	PQR Contractors	789 Commercial Zone, City, State - 987654	Bob Owner	9876543212	admin@pqr.com	2025-07-23 12:10:26.509663	NAME3	DSTG5SD	DFSGDFG
1	esafdsaf	NO.565fsfdsf vsdf dsfdfssdf dsf dsf	dfasfgrgfsdaf	789654133	qwerty6i9o@gmail.com	2025-07-28 12:17:36.681953	ram kumarq	FGHJ567HG	6789HJKASDASD
2	akramcompany	dummy address	akram	9940356779	adafd@gmail.com	2025-07-30 12:37:57.938386	Akram javeed	GHGF23YT	YFHG564D
8	SAT	sample address 7/4, sample street, sample nagar, chennai	Annis kumar abilash	9940356779	aakram94@gmail.com	2025-08-05 15:06:14.901925	Chandrasekar	IUJ548UHT	76HJG6HJ3D
7	RAMCO	AYANAVARAM	RAMESH	9658741230	aakram94@gmail.com	2025-08-04 12:01:57.011998	RAMESH	GBF65FFD	345678EFDEWFYH0978FG
9	Super Tech	No.5/8, VOC Street\nSubramanian Nagar	Annis kumar	9940356779	aakram94@gmail.com	2025-08-07 14:47:18.005501	Annis kumar	JHY8945U	GST9876543
10	Tamil Global Works	No.5, Ambattur high road, Ambattur, Chennai - 600011	Tamil Vasanthan	9025760964	tamilvasanthan22@gmail.com	2025-08-12 12:13:06.037692	Tamil Vasanthan	GBDJ876BG	GST26344734543
\.


--
-- TOC entry 5056 (class 0 OID 41034)
-- Dependencies: 228
-- Data for Name: gate_pass_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gate_pass_applications (id, loa_number, contract_supervisor_name, supervisor_phone, gate_pass_period_from, gate_pass_period_to, insurance_coverage, esi_insurance_no, labour_license_no, migration_license_no, uploaded_file_path, status, submitted_date, created_at, final_status, pdf_generated, sent_date, special_timing, special_timing_from, special_timing_to, factory_manager_approval_file, labour_license, license_no, license_employee_count, license_file, license_remarks, inter_state_migration, migration_remarks, insurance_from, insurance_to, firm_id, employee_count, labour_remarks, migration_details, has_insurance, insurance_no, insurance_persons, insurance_file, has_esi, esi_number, esi_persons, esi_date_of_issue, esi_file, tool_items, number_of_persons, number_of_supervisors, officer1_status, officer1_remarks, officer1_reviewed_date, officer2_status, officer2_remarks, officer2_reviewed_date, forwarded_to, assigned_safety_officer_id, assigned_officer1_id, assigned_officer2_id, forwarded_to_officer, rejection_reason, updated_at, approved_by_sse_date, approved_by_safety_date, approved_by_officer1_date, approved_by_officer2_date, approved_by_chos_date, pdf_file_path, email_sent_date, uploaded_files, gate_permit_number, executing_sse_id, sse_remarks, sse_action, safety_remarks, safety_action, approved_by_sse_id, approved_by_safety_id, chos_remarks, chos_dsc_signature, approved_by_chos_id, firm_name, supervisors, contractor_name, contractor_email, contractor_phone, contractor_address, firm_pan, firm_gst, supervisors_json, primary_supervisor_name, primary_supervisor_phone) FROM stdin;
5	LOA98547	BALAJI	3216549874	2025-08-01	2025-08-31	\N	\N	\N	\N	\N	pending_with_sse	2025-08-05 17:12:56.975	2025-08-05 17:12:56.972773	pending	f	\N	f	\N	\N	\N	f	JKUYHFUY78546456	\N	\N	\N	f	\N	2025-08-01	2025-08-31	8	4	\N	\N	t	RFGREWS5T6443	10	\N	f	\N	0	\N	\N	[{"id": "1", "type": "Machine", "quantity": "1", "description": "POIU"}]	4	1	pending	\N	2025-08-05 17:12:56.972773	pending	\N	2025-08-05 17:12:56.972773	\N	\N	\N	\N	\N	\N	2025-08-11 12:27:09.724331	\N	\N	\N	\N	\N	\N	\N	{"insurance_file":"1754394176938-870630454-aaaa.pdf","main_file":"1754394176940-876426162-holiday home.pdf"}	\N	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "BALAJI", "phone": "3216549874"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "BALAJI", "phone": "3216549874"}]	BALAJI	3216549874
4	LOA098536	Saravanan	7779658465	2025-08-01	2025-08-31	\N	\N	\N	\N	\N	pdf_generated	2025-08-04 12:08:53.730312	2025-08-04 12:08:53.730312	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	f	\N	2025-08-01	2025-08-31	7	4	\N	\N	t	HFYY0987	10	1754289533689-195472973-1753944177568-86271510-Gmail - Attachment of previous mails.pdf	f	\N	\N	\N	\N	[{"id": "1", "type": "Machine", "quantity": "1", "description": "Slicing Machine"}]	4	1	pending	\N	2025-08-04 12:08:53.730312	approved	Approved by OFFICER2	2025-08-08 09:43:01.99949	\N	\N	\N	5	officer2	\N	2025-08-11 12:27:09.724331	2025-08-08 09:42:33.103657	2025-08-08 09:42:49.789839	\N	2025-08-08 09:43:01.99949	2025-08-08 09:44:48.40658	uploads/pdfs/gate-pass-LOA098536-1754626488414.pdf	\N	\N	GP/2025/0004	2	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	2	3	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "Saravanan", "phone": "7779658465"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "Saravanan", "phone": "7779658465"}]	Saravanan	7779658465
51	LOA098765	Saravanan	9874563210	2025-08-13	2025-08-30	\N	\N	\N	\N	\N	pdf_generated	2025-08-11 16:22:24.49	2025-08-11 16:22:24.49	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	t	\N	2025-08-11	2025-08-31	9	10	\N	\N	t	INS2025/08/10	10	\N	f	\N	\N	\N	\N	[{"id": "1", "type": "Tools", "quantity": "1", "description": "MJNHDGF"}, {"id": "1754909452304", "type": "Material", "quantity": "1", "description": "GRDSGFD"}, {"id": "1754909457552", "type": "Vehicle", "quantity": "1", "description": "SDAFHIH"}]	10	2	pending	\N	2025-08-11 16:22:24.483958	approved	Approved by OFFICER2	2025-08-11 16:24:27.989691	\N	\N	\N	5	officer2	\N	2025-08-11 16:43:54.125748	2025-08-11 16:23:24.660135	2025-08-11 16:24:05.121982	\N	2025-08-11 16:24:27.989691	2025-08-11 16:43:54.125748	uploads/pdfs/gate-pass-LOA098765-1754910834137.pdf	\N	{"insurance_file":"1754909544330-586828707-SAT.pdf"}	GP/2025/0051	9	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	9	3	PDF generated with digital signature	\N	\N	Super Tech	[{"id": "1", "name": "Saravanan", "phone": "9874563210"}, {"id": "1754909411545", "name": "Tamil vasanthan", "phone": "9874563210"}]	Annis kumar	aakram94@gmail.com	9940356779	No.5/8, VOC Street\nSubramanian Nagar	JHY8945U	GST9876543	\N	\N	\N
46	LOA000567	BALAJI	9874563214	2025-08-09	2025-08-31	\N	\N	\N	\N	\N	pdf_generated	2025-08-08 16:10:10.005	2025-08-08 16:10:09.999859	pending	t	\N	t	16:07:00	04:07:00	\N	t	LB2157896541258741	\N	\N	\N	f	\N	2025-08-01	2025-08-31	9	25	\N	\N	t	INS2025/08/06	20	\N	f	\N	0	\N	\N	[{"id": "1", "type": "Tools", "quantity": "1", "description": "TOOL 1"}, {"id": "1754649260688", "type": "Material", "quantity": "1", "description": "MATERIAL 1"}, {"id": "1754649270031", "type": "Machine", "quantity": "1", "description": "MACHINE 1"}, {"id": "1754649278440", "type": "Vehicle", "quantity": "1", "description": "TN05 BW2345"}]	25	2	pending	\N	2025-08-08 16:10:09.999859	approved	Approved by OFFICER2	2025-08-08 17:12:57.706582	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-08 17:11:42.926689	2025-08-08 17:12:43.695247	\N	2025-08-08 17:12:57.706582	2025-08-08 17:13:12.472087	uploads/pdfs/gate-pass-LOA000567-1754653392475.pdf	\N	{"insurance_file":"1754649609966-904487622-1753944177568-86271510-Gmail - Attachment of previous mails.pdf"}	GP/2025/0046	9	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	9	3	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "BALAJI", "phone": "9874563214"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "BALAJI", "phone": "9874563214"}]	BALAJI	9874563214
57	LOA20250812	Saravanan	9874566352	2025-08-14	2025-08-31	\N	\N	\N	\N	\N	approved	2025-08-14 15:16:32.626	2025-08-14 15:16:32.626	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	t	\N	2025-08-01	2025-08-31	10	10	\N	\N	t	INS2025/08/11	15	\N	f	\N	\N	\N	\N	[]	10	1	approved	Approved by OFFICER1	2025-08-14 15:18:57.053146	approved	Approved by OFFICER2	2025-08-14 15:19:37.248825	\N	\N	4	5	officer1	\N	2025-08-14 15:20:11.506414	2025-08-14 15:17:15.079126	2025-08-14 15:18:33.134198	2025-08-14 15:18:57.053146	2025-08-14 15:19:37.248825	2025-08-14 15:20:04.463949	uploads/pdfs/gate-pass-LOA20250812-1755165004470.pdf	2025-08-14 15:20:11.506414	{}	GP/2025/0057	9	Approved by SSE	approved	Approved by Safety Officer and forwarded to AWM/C	approved	9	3	PDF generated with digital signature	\N	\N	Tamil Global Works	[{"id": "1", "name": "Saravanan", "phone": "9874566352"}]	Tamil Vasanthan	tamilvasanthan22@gmail.com	9025760964	No.5, Ambattur high road, Ambattur, Chennai - 600011	GBDJ876BG	GST26344734543	\N	\N	\N
3	LOA1234JD98	kanna	9632587412	2025-07-01	2025-07-31	\N	\N	\N	dsfasdfsadfsdf	1753944177573-879171089-whatsapp (1).png	pdf_generated	2025-07-31 12:12:57.715908	2025-07-31 12:12:57.715908	pending	t	\N	t	12:06:00	00:06:00	1753944177568-86271510-Gmail - Attachment of previous mails.pdf	f	\N	\N	\N	\N	t	fsdfsfsdfs	2025-07-01	2025-07-31	3	5	\N	dfsdafasfds	t	4534543543	20	1753944177568-343215532-Online gatepass application flow process.pdf	f	\N	\N	\N	\N	[{"id": "1", "type": "Tools", "quantity": "3", "description": "heello tool"}]	5	1	pending	\N	2025-07-31 12:12:57.715908	approved	Approved by OFFICER2	2025-08-08 14:20:55.926051	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-08 14:19:49.489247	2025-08-08 14:20:31.973577	\N	2025-08-08 14:20:55.926051	2025-08-08 14:21:25.262949	uploads/pdfs/gate-pass-LOA1234JD98-1754643085270.pdf	\N	\N	GP/2025/0003	2	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	2	11	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "kanna", "phone": "9632587412"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "kanna", "phone": "9632587412"}]	kanna	9632587412
2	LOA1234JD98	tamil	9632587412	2025-07-01	2025-07-31	\N	\N	\N	453rw44rw4	1753943306531-138529315-TPJ TO MS 21-07-2025.pdf	pdf_generated	2025-07-31 11:58:26.57309	2025-07-31 11:58:26.57309	pending	t	\N	t	11:39:00	23:39:00	1753943306524-852119873-683fa7bfaf9e70536268942c.pdf	f	\N	\N	\N	\N	t	esrfasefdsef	2025-07-01	2025-07-31	3	10	\N	sdefw4arfaseef	t	4534543543	10	1753943306525-892581671-Online gatepass application flow process.pdf	f	\N	\N	\N	\N	[{"id": "1", "type": "Machine", "quantity": "1", "description": "dfsdf"}]	10	1	pending	\N	2025-07-31 11:58:26.57309	approved	Approved by OFFICER2	2025-08-08 15:36:33.160086	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-08 15:35:24.415355	2025-08-08 15:35:51.700133	\N	2025-08-08 15:36:33.160086	2025-08-08 15:37:16.488583	uploads/pdfs/gate-pass-LOA1234JD98-1754647636494.pdf	\N	\N	GP/2025/0002	2	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	2	11	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "tamil", "phone": "9632587412"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "tamil", "phone": "9632587412"}]	tamil	9632587412
53	LOA20250812	BALAJI	9940356779	2025-08-13	2025-08-31	\N	\N	\N	\N	\N	pending_with_officer2	2025-08-12 12:24:36.482	2025-08-12 12:24:36.482	pending	f	\N	f	\N	\N	\N	f	\N	\N	\N	\N	t	\N	\N	\N	10	10	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	[{"id": "1", "type": "Tools", "quantity": "1", "description": "TOOL1"}]	10	1	approved	Approved by OFFICER1	2025-08-13 10:43:28.881113	pending	\N	2025-08-12 12:24:36.477967	\N	\N	4	\N	officer1	\N	2025-08-13 10:43:28.881113	2025-08-13 10:42:08.045553	2025-08-13 10:43:01.964263	2025-08-13 10:43:28.881113	\N	\N	\N	\N	{}	\N	9	Approved by SSE	approved	Approved by Safety Officer and forwarded to AWM/C	approved	9	3	\N	\N	\N	Tamil Global Works	[{"id": "1", "name": "BALAJI", "phone": "9940356779"}]	Tamil Vasanthan	tamilvasathan22@gmail.com	9025760964	No.5, Ambattur high road, Ambattur, Chennai - 600011	GBDJ876BG	GST26344734543	\N	\N	\N
52	LOA20250812	Saravanan	9940356779	2025-08-13	2025-08-31	\N	\N	\N	\N	\N	pdf_generated	2025-08-12 12:19:29.174	2025-08-12 12:19:29.174	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	t	\N	2025-08-13	2025-08-31	10	10	\N	\N	t	INS2025/08/11	20	\N	f	\N	\N	\N	\N	[{"id": "1", "type": "Tools", "quantity": "1", "description": "Tool1"}, {"id": "1754981295696", "type": "Machine", "quantity": "1", "description": "Machine1"}, {"id": "1754981303024", "type": "Vehicle", "quantity": "1", "description": "TN05 GF1234"}]	10	1	pending	\N	2025-08-12 12:19:29.170197	approved	Approved by OFFICER2	2025-08-12 12:42:25.313256	\N	\N	\N	5	officer2	\N	2025-08-12 12:43:52.072666	2025-08-12 12:39:23.290814	2025-08-12 12:41:34.620423	\N	2025-08-12 12:42:25.313256	2025-08-12 12:43:52.072666	uploads/pdfs/gate-pass-LOA20250812-1754982832077.pdf	\N	{"insurance_file":"1754981369135-350155179-2edit.pdf"}	GP/2025/0052	9	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	9	3	PDF generated with digital signature	\N	\N	Tamil Global Works	[{"id": "1", "name": "Saravanan", "phone": "9940356779"}]	Tamil Vasanthan	tamilvasathan22@gmail.com	9025760964	No.5, Ambattur high road, Ambattur, Chennai - 600011	GBDJ876BG	GST26344734543	\N	\N	\N
1	LOA1234JD98	ramesh	9632587412	2025-07-01	2025-07-31	\N	\N	\N	453rw44rw4	1753941682060-547439915-TPJ TO MS 21-07-2025(2).pdf	pdf_generated	2025-07-31 11:31:22.234257	2025-07-31 11:31:22.234257	pending	t	\N	t	11:14:00	23:14:00	1753941682055-99926550-Rudransh Singh 25152 Receipt (1).pdf	f	\N	\N	\N	\N	t	esrfasefdsef	2025-07-01	2025-07-31	3	10	\N	sdefw4arfaseef	t	4534543543	15	1753941682057-298831201-Shop change Final Copy (1).pdf	f	\N	\N	\N	\N	[{"id": "1", "type": "Material", "quantity": "1", "description": "asd"}]	10	1	pending	\N	2025-07-31 11:31:22.234257	approved	Approved by OFFICER2	2025-08-08 15:59:19.24713	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-08 15:58:52.591013	2025-08-08 15:59:07.6124	\N	2025-08-08 15:59:19.24713	2025-08-08 15:59:34.462236	uploads/pdfs/gate-pass-LOA1234JD98-1754648974468.pdf	\N	\N	GP/2025/0001	2	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	2	3	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "ramesh", "phone": "9632587412"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "ramesh", "phone": "9632587412"}]	ramesh	9632587412
54	LOA20250812	Suresh kumar	9874562185	2025-08-01	2025-08-31	\N	\N	\N	\N	\N	pending_with_sse	2025-08-12 16:18:59.027	2025-08-12 16:18:59.027	pending	f	\N	f	\N	\N	\N	f	\N	\N	\N	\N	t	\N	\N	\N	10	20	\N	\N	f	\N	\N	\N	t	ESI0987455784	24	2025-08-01	\N	[]	20	2	pending	\N	2025-08-12 16:18:59.018521	pending	\N	2025-08-12 16:18:59.018521	\N	\N	\N	\N	\N	\N	2025-08-12 16:18:59.027	\N	\N	\N	\N	\N	\N	\N	{}	\N	9	\N	\N	\N	\N	\N	\N	\N	\N	\N	Tamil Global Works	[{"id": "1", "name": "Suresh kumar", "phone": "9874562185"}, {"id": "1754995392018", "name": "Ramesh kumar", "phone": "9874563214"}]	Tamil Vasanthan	tamilvasathan22@gmail.com	9025760964	No.5, Ambattur high road, Ambattur, Chennai - 600011	GBDJ876BG	GST26344734543	\N	\N	\N
39	LOA12344	RAMANA	7412589637	2025-08-01	2025-08-31	\N	\N	\N	ESFSAEF4534534R	\N	pdf_generated	2025-08-06 10:52:39.249	2025-08-06 10:52:39.248782	pending	t	\N	t	10:50:00	22:51:00	\N	f	\N	\N	\N	\N	t	\N	2025-08-01	2025-08-31	8	10	\N	SDFASEF4R45TRERF	t	LKF78965412	10	\N	f	\N	0	\N	\N	[{"id": "1", "type": "Machine", "quantity": "1", "description": "PC"}, {"id": "1754457682677", "type": "Machine", "quantity": "1", "description": "PRINTER"}]	10	1	approved	Approved by OFFICER1	2025-08-07 12:48:06.636602	approved	generate gatepass	2025-08-07 12:56:31.976482	\N	\N	4	5	officer1	\N	2025-08-11 12:11:12.46179	2025-08-06 15:39:02.318657	2025-08-07 11:41:14.130965	2025-08-07 12:48:06.636602	2025-08-07 12:56:31.976482	2025-08-07 13:39:05.80262	uploads/pdfs/gate-pass-LOA12344-1754554145813.pdf	\N	{"factory_manager_approval":"1754457759111-821379196-CW WEBSITE038.pdf","insurance_file":"1754457759111-424788035-16-03-2023-1.pdf","main_file":"1754457759113-714113001-Proprty Tax 2024.PDF"}	GP/2025/0039	9	Test SSE remarks	approved	all documents cleared	approved	1	3	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "RAMANA", "phone": "7412589637"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "RAMANA", "phone": "7412589637"}]	RAMANA	7412589637
50	LOA098765	Supervisor1	9632584154	2025-08-12	2025-08-30	\N	\N	\N	\N	\N	pdf_generated	2025-08-11 11:31:04.17	2025-08-11 11:31:04.166584	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	f	\N	\N	\N	9	15	\N	\N	f	\N	0	\N	f	\N	0	\N	\N	[{"id": "1", "type": "Tools", "quantity": "1", "description": "dsfsafasf"}, {"id": "1754890861516", "type": "Material", "quantity": "2", "description": "dfdsf"}]	15	2	pending	\N	2025-08-11 11:31:04.166584	approved	Approved by OFFICER2	2025-08-11 11:32:10.122351	\N	\N	\N	5	officer2	\N	2025-08-11 12:27:21.433804	2025-08-11 11:31:33.818594	2025-08-11 11:31:53.763129	\N	2025-08-11 11:32:10.122351	2025-08-11 11:37:28.427081	uploads/pdfs/gate-pass-LOA098765-1754892448437.pdf	\N	{}	GP/2025/0050	9	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	9	3	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "Supervisor1", "phone": "9632584154"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "Supervisor1", "phone": "9632584154"}]	Supervisor1	9632584154
55	LOA20250812	ramesh	7896655564	2025-08-13	2025-08-31	\N	\N	\N	\N	\N	approved	2025-08-12 16:36:13.655	2025-08-12 16:36:13.655	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	t	\N	\N	\N	10	20	\N	\N	f	\N	\N	\N	t	ESI0987455780	25	2025-08-01	\N	[]	20	2	approved	Approved by OFFICER1	2025-08-12 16:57:21.415486	approved	Approved by OFFICER2	2025-08-13 10:44:04.158329	\N	\N	4	5	officer1	\N	2025-08-13 12:22:35.104396	2025-08-12 16:40:01.136992	2025-08-12 16:56:18.485938	2025-08-12 16:57:21.415486	2025-08-13 10:44:04.158329	2025-08-13 10:44:39.986821	uploads/pdfs/gate-pass-LOA20250812-1755062079994.pdf	2025-08-13 12:22:35.104396	{}	GP/2025/0055	9	Approved by SSE	approved	Approved by Safety Officer and forwarded to AWM/C	approved	9	3	PDF generated with digital signature	\N	\N	Tamil Global Works	[{"id": "1", "name": "ramesh", "phone": "7896655564"}, {"id": "1754996717966", "name": "Tamil", "phone": "4876148762"}]	Tamil Vasanthan	tamilvasathan22@gmail.com	9025760964	No.5, Ambattur high road, Ambattur, Chennai - 600011	GBDJ876BG	GST26344734543	\N	\N	\N
40	LOA/001/01	Subash	9940356779	2025-08-01	2025-08-31	\N	\N	\N	\N	\N	pending_with_sse	2025-08-07 14:37:13.447	2025-08-07 14:37:13.443821	pending	f	\N	f	\N	\N	\N	f	987623ANHV89	\N	\N	\N	f	\N	2025-08-01	2025-08-31	7	4	\N	\N	t	098344566	10	\N	f	\N	0	\N	\N	[{"id": "1", "type": "", "quantity": "", "description": ""}]	4	1	pending	\N	2025-08-07 14:37:13.443821	pending	\N	2025-08-07 14:37:13.443821	\N	\N	\N	\N	\N	\N	2025-08-11 12:11:12.46179	\N	\N	\N	\N	\N	\N	\N	{"insurance_file":"1754557633408-636542039-2edit.pdf"}	\N	10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "Subash", "phone": "9940356779"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "Subash", "phone": "9940356779"}]	Subash	9940356779
41	LOA/25/8/1	Tamil Vasanthan	9600106078	2025-08-08	2025-08-31	\N	\N	\N	\N	\N	pdf_generated	2025-08-07 15:27:42.448	2025-08-07 15:27:42.44458	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	f	\N	2025-08-01	2025-08-31	9	19	\N	\N	t	INS2025/08/01	20	\N	f	\N	0	\N	\N	[{"id": "1", "type": "Material", "quantity": "10", "description": "Brown stick"}, {"id": "1754560161755", "type": "Material", "quantity": "10", "description": "cleaner"}]	19	1	approved	ok	2025-08-07 16:08:49.753934	approved	issue gatepass	2025-08-07 16:09:48.060101	\N	\N	8	5	officer1	\N	2025-08-11 12:11:12.46179	2025-08-07 15:56:03.870417	2025-08-07 16:07:45.073013	2025-08-07 16:08:49.753934	2025-08-07 16:09:48.060101	2025-08-07 16:38:40.565726	uploads/pdfs/gate-pass-LOA_25_8_1-1754564920575.pdf	\N	{"insurance_file":"1754560662297-873088712-09-04-2025.pdf"}	GP/2025/0041	2	For Approval please	approved	insurance checked ok	approved	2	3	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "Tamil Vasanthan", "phone": "9600106078"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "Tamil Vasanthan", "phone": "9600106078"}]	Tamil Vasanthan	9600106078
42	LOA/25/8/1	HEllooo	9632587412	2025-08-01	2025-08-31	\N	\N	\N	\N	\N	pdf_generated	2025-08-07 15:54:09.759	2025-08-07 15:54:09.753387	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	f	\N	2025-08-01	2025-08-31	9	19	\N	\N	t	JFGY986876	20	\N	f	\N	0	\N	\N	[{"id": "1", "type": "Material", "quantity": "1", "description": "sdfasdfasdf"}]	19	1	pending	\N	2025-08-07 15:54:09.753387	approved	issue gatepermit	2025-08-07 16:48:37.021241	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-07 16:46:50.701491	2025-08-07 16:48:02.210041	\N	2025-08-07 16:48:37.021241	2025-08-07 17:03:04.474862	uploads/pdfs/gate-pass-LOA_25_8_1-1754566384483.pdf	\N	{"insurance_file":"1754562249721-529013151-old daily attendence summary.pdf"}	GP/2025/0042	2	checked	approved	insurance are checked.	approved	2	3	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "HEllooo", "phone": "9632587412"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "HEllooo", "phone": "9632587412"}]	HEllooo	9632587412
43	LOA098756437	Saravana kumar	9940356779	2025-08-09	2025-08-31	\N	\N	\N	\N	\N	pdf_generated	2025-08-08 08:34:59.561	2025-08-08 08:34:59.556487	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	f	\N	2025-08-01	2025-08-31	7	19	\N	\N	t	INS2025/08/02	20	\N	f	\N	0	\N	\N	[{"id": "1", "type": "Machine", "quantity": "2", "description": "Welding plant"}, {"id": "1754622226463", "type": "Machine", "quantity": "1", "description": "Cutting machine"}, {"id": "1754622242239", "type": "Tools", "quantity": "10", "description": "Gloves"}]	19	1	pending	\N	2025-08-08 08:34:59.556487	approved	Issue gate permit	2025-08-08 08:37:33.604302	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-08 08:35:45.241265	2025-08-08 08:36:50.754958	\N	2025-08-08 08:37:33.604302	2025-08-08 08:37:52.760816	uploads/pdfs/gate-pass-LOA098756437-1754622472765.pdf	\N	{"insurance_file":"1754622299411-260338461-gate-pass-42.pdf"}	GP/2025/0043	2	All ok kindly check insurance	approved	All Documents ok, For approval sir.	approved	2	11	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "Saravana kumar", "phone": "9940356779"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "Saravana kumar", "phone": "9940356779"}]	Saravana kumar	9940356779
38	LOA1234JD98	Annis	9856321473	2025-08-01	2025-08-31	\N	\N	\N	\N	\N	pdf_generated	2025-08-06 08:58:07.644	2025-08-06 08:58:07.64333	pending	t	\N	t	08:56:00	20:56:00	\N	f	7896541KJGF	\N	\N	\N	f	\N	2025-08-01	2025-08-31	3	4	\N	\N	t	LKKJG648433	10	\N	f	\N	0	\N	\N	[{"id": "1", "type": "Material", "quantity": "1", "description": "cutting machine"}, {"id": "1754450803083", "type": "Material", "quantity": "1", "description": "welding machine"}]	4	1	pending	\N	2025-08-06 08:58:07.64333	approved	Approved by OFFICER2	2025-08-08 09:22:56.996262	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-08 09:20:38.302265	2025-08-08 09:22:33.673139	\N	2025-08-08 09:22:56.996262	2025-08-08 09:23:11.482171	uploads/pdfs/gate-pass-LOA1234JD98-1754625191485.pdf	\N	{"factory_manager_approval":"1754450887608-236764700-1.pdf","insurance_file":"1754450887609-660263346-2.pdf","main_file":"1754450887611-354622699-2edit.pdf"}	GP/2025/0038	2	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	2	11	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "Annis", "phone": "9856321473"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "Annis", "phone": "9856321473"}]	Annis	9856321473
44	LOA/25/8/1	Saravanan	9632587412	2025-08-09	2025-08-31	\N	\N	\N	XXXXX	\N	pdf_generated	2025-08-08 11:54:26.183	2025-08-08 11:54:26.179995	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	f	ZZZZZ	2025-08-01	2025-08-31	9	19	\N	YYYYYY	t	INS2025/08/04	22	\N	f	\N	0	\N	\N	[{"id": "1", "type": "Machine", "quantity": "2", "description": "Welding plant"}]	19	2	pending	\N	2025-08-08 11:54:26.179995	approved	issue gate permit	2025-08-08 12:01:47.671491	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-08 12:00:09.699564	2025-08-08 12:01:08.77032	\N	2025-08-08 12:01:47.671491	2025-08-08 12:02:12.763585	uploads/pdfs/gate-pass-LOA_25_8_1-1754634732767.pdf	\N	{"insurance_file":"1754634266146-800650168-gate-pass-43.pdf"}	GP/2025/0044	2	Checked	approved	documents checked	approved	2	11	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "Saravanan", "phone": "9632587412"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "Saravanan", "phone": "9632587412"}]	Saravanan	9632587412
45	LOA098756437	RAM KUMAR	9874563210	2025-08-09	2025-08-31	\N	\N	\N	\N	\N	pdf_generated	2025-08-08 14:27:03.562	2025-08-08 14:27:03.55863	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	f	\N	2025-08-08	2025-08-31	7	19	\N	\N	t	INS2025/08/05	20	\N	f	\N	0	\N	\N	[{"id": "1", "type": "Tools", "quantity": "2", "description": "TOOL 1"}, {"id": "1754643322933", "type": "Material", "quantity": "3", "description": "MACHINE 1"}, {"id": "1754643332925", "type": "Vehicle", "quantity": "1", "description": "TN05AW3456"}, {"id": "1754643352084", "type": "Machine", "quantity": "1", "description": "MACHINE 3"}]	19	1	pending	\N	2025-08-08 14:27:03.55863	approved	Approved by OFFICER2	2025-08-08 14:29:23.57299	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-08 14:27:41.42963	2025-08-08 14:28:44.639221	\N	2025-08-08 14:29:23.57299	2025-08-08 14:30:00.992776	uploads/pdfs/gate-pass-LOA098756437-1754643600998.pdf	\N	{"insurance_file":"1754643423524-607783125-gate-pass-42.pdf"}	GP/2025/0045	2	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	2	11	PDF generated with digital signature	\N	\N	\N	[{"id": "1", "name": "RAM KUMAR", "phone": "9874563210"}]	\N	\N	\N	\N	\N	\N	[{"id": "1", "name": "RAM KUMAR", "phone": "9874563210"}]	RAM KUMAR	9874563210
47	LOA098765	Saravanan	9940356779	2025-08-13	2025-08-30	\N	\N	\N	\N	\N	pdf_generated	2025-08-11 08:51:33.269	2025-08-11 08:51:33.261486	pending	t	\N	t	08:50:00	20:50:00	\N	f	\N	\N	\N	\N	f	\N	2025-08-12	2025-08-31	9	15	\N	\N	t	INS2025/08/08	20	\N	f	\N	\N	\N	\N	[{"id": "1", "type": "Tools", "quantity": "1", "description": "Tool1"}, {"id": "1754882455080", "type": "Machine", "quantity": "1", "description": "Machine1"}, {"id": "1754882461840", "type": "Vehicle", "quantity": "1", "description": "TN05UH6784"}]	15	2	pending	\N	2025-08-11 08:51:33.261486	approved	Approved by OFFICER2	2025-08-11 09:13:21.065596	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-11 08:54:13.74686	2025-08-11 09:13:03.526835	\N	2025-08-11 09:13:21.065596	2025-08-11 09:13:34.402015	uploads/pdfs/gate-pass-LOA098765-1754883814406.pdf	\N	{"factory_manager_approval":"1754882493227-126103211-CW WEBSITE038.pdf","insurance_file":"1754882493228-850409568-16-03-2023.pdf"}	GP/2025/0047	9	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	9	3	PDF generated with digital signature	\N	\N	Super Tech	[{"id": "1", "name": "Saravanan", "phone": "9940356779"}, {"id": "1754882415528", "name": "Ramesh kumar", "phone": "9856321471"}]	Annis kumar	aakram94@gmail.com	9940356779	No.5/8, VOC Street\nSubramanian Nagar	JHY8945U	GST9876543	[{"id": "1", "name": "Saravanan", "phone": "9940356779"}]	Saravanan	9940356779
49	LOA098765	Supervisor1	1478523698	2025-08-12	2025-08-30	\N	\N	\N	\N	\N	pdf_generated	2025-08-11 11:01:57.241	2025-08-11 11:01:57.241	pending	t	\N	f	\N	\N	\N	f	\N	\N	\N	\N	f	\N	2025-08-01	2025-08-31	9	15	\N	\N	t	INS2025/08/09	20	\N	f	\N	\N	\N	\N	[{"id": "1", "type": "Tools", "quantity": "1", "description": "Tool1"}, {"id": "1754890272284", "type": "Machine", "quantity": "1", "description": "Machine1"}, {"id": "1754890280166", "type": "Vehicle", "quantity": "1", "description": "TN05BH1234"}]	15	2	pending	\N	2025-08-11 11:01:57.237195	approved	Approved by OFFICER2	2025-08-11 11:32:15.03792	\N	\N	\N	5	officer2	\N	2025-08-11 12:11:12.46179	2025-08-11 11:06:30.128744	2025-08-11 11:06:55.35998	\N	2025-08-11 11:32:15.03792	2025-08-11 11:32:32.645845	uploads/pdfs/gate-pass-LOA098765-1754892152651.pdf	\N	{}	GP/2025/0049	9	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	9	3	PDF generated with digital signature	\N	\N	Super Tech	[{"id": "1", "name": "Supervisor1", "phone": "1478523698"}, {"id": "1754890247805", "name": "Supervisor2", "phone": "7412589630"}]	Annis kumar	aakram94@gmail.com	9940356779	No.5/8, VOC Street\nSubramanian Nagar	JHY8945U	GST9876543	[{"id": "1", "name": "Supervisor1", "phone": "1478523698"}]	Supervisor1	1478523698
48	LOA098765	kannan kailash	9632587412	2025-08-13	2025-08-30	\N	\N	\N	\N	\N	pdf_generated	2025-08-11 10:39:57.271	2025-08-11 10:39:57.271	pending	t	\N	t	10:38:00	22:38:00	factory_manager_approval_file-1754888997230-24519753.pdf	f	\N	\N	\N	\N	f	\N	2025-08-01	2025-08-31	9	20	\N	\N	t	INS2025/08/09	22	insurance_file-1754888997231-607203029.pdf	f	\N	\N	\N	\N	[{"id": "1", "type": "Tools", "quantity": "1", "description": "Tool1"}, {"id": "1754888923513", "type": "Machine", "quantity": "1", "description": "Machine1"}, {"id": "1754888931889", "type": "Material", "quantity": "1", "description": "Material1"}, {"id": "1754888941881", "type": "Vehicle", "quantity": "1", "description": "TN05 AB1234"}]	20	2	pending	\N	2025-08-11 10:39:57.264841	approved	Approved by OFFICER2	2025-08-11 10:39:57.264841	\N	\N	\N	5	officer2	\N	2025-08-11 12:43:41.039546	2025-08-11 10:41:10.877094	2025-08-11 10:41:50.575408	\N	2025-08-11 10:42:07.556476	2025-08-11 12:43:41.039546	uploads/pdfs/gate-pass-LOA098765-1754896421050.pdf	\N	{"factory_manager_approval":"factory_manager_approval_file-1754888997230-24519753.pdf","insurance_file":"insurance_file-1754888997231-607203029.pdf"}	GP/2025/0048	9	Approved by SSE	approved	Approved by Safety Officer and forwarded to DY.CME/C	approved	9	3	PDF generated with digital signature	\N	\N	Super Tech	[{"id": "1", "name": "kannan kailash", "phone": "9632587412"}, {"id": "1754888883713", "name": "Akram javeed", "phone": "9940356779"}]	Annis kumar	aakram94@gmail.com	9940356779	No.5/8, VOC Street\nSubramanian Nagar	JHY8945U	GST9876543	[{"id": "1", "name": "kannan kailash", "phone": "9632587412"}]	kannan kailash	9632587412
\.


--
-- TOC entry 5066 (class 0 OID 57359)
-- Dependencies: 238
-- Data for Name: gate_pass_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gate_pass_files (id, gate_pass_id, file_name, file_url, file_type, uploaded_at) FROM stdin;
\.


--
-- TOC entry 5058 (class 0 OID 41051)
-- Dependencies: 230
-- Data for Name: gate_pass_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gate_pass_items (id, gate_pass_id, description, item_type, quantity, created_at) FROM stdin;
\.


--
-- TOC entry 5052 (class 0 OID 40992)
-- Dependencies: 224
-- Data for Name: officers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.officers (id, name, designation, employee_id, phone, email, role, created_at) FROM stdin;
1	APE	Assistant Engineer	OFF001	9876543230	a.kumar@railway.gov	officer1	2025-07-23 12:10:26.509663
2	AWM/C	Factory Manager	OFF002	9876543231	b.singh@railway.gov	officer2	2025-07-23 12:10:26.509663
3	AWM/W	Ch.OS/NPB	OFF003	9876543232	c.sharma@railway.gov	chos_npb	2025-07-23 12:10:26.509663
\.


--
-- TOC entry 5050 (class 0 OID 40982)
-- Dependencies: 222
-- Data for Name: railway_sse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.railway_sse (id, name, employee_id, department, phone, email, created_at) FROM stdin;
1	WR SSE	SSE001	Engineering	9876543220	john.sse@railway.gov	2025-07-23 12:10:26.509663
2	AB SSE	SSE002	Mechanical	9876543221	jane.sse@railway.gov	2025-07-23 12:10:26.509663
3	BL SSE	SSE003	Electrical	9876543222	mike.sse@railway.gov	2025-07-23 12:10:26.509663
\.


--
-- TOC entry 5046 (class 0 OID 40962)
-- Dependencies: 218
-- Data for Name: shops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shops (id, name, location, created_at) FROM stdin;
1	BR	North Section	2025-07-23 12:10:26.509663
2	BL	South Section	2025-07-23 12:10:26.509663
3	AB	Central Section	2025-07-23 12:10:26.509663
4	DBG	East Section	2025-07-23 12:10:26.509663
5	WR	WR	2025-08-07 14:49:12.810408
\.


--
-- TOC entry 5072 (class 0 OID 114691)
-- Dependencies: 244
-- Data for Name: temporary_gate_passes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.temporary_gate_passes (id, temp_pass_number, firm_name, firm_address, representative_name, phone_number, email, aadhar_number, number_of_persons, nature_of_work, period_from, period_to, forward_to_user_id, forward_to_role, forward_to_name, status, current_officer_id, approved_by_officer_id, officer_approval_date, officer_remarks, approved_by_chos_id, chos_approval_date, pdf_generated, pdf_file_path, gate_permit_number, rejected_by_user_id, rejection_date, rejection_reason, submitted_date, updated_at, created_by, email_sent, email_sent_date) FROM stdin;
1	TEMP/2025/823047	Vasista technologies	No.5/8, Voc Street, subramani nagar, perambur, chennai- 11	Akram javeed	9940356779	aakram94@gmail.com	123654789654	3	Network slicing	2025-08-14	2025-08-14	5	officer2		pending_with_chos	5	5	2025-08-14 08:45:36.921126	Approved by officer2	\N	\N	f	\N	\N	\N	\N	\N	2025-08-14 08:20:23.047	2025-08-14 08:45:36.921126	public_form	f	\N
\.


--
-- TOC entry 5074 (class 0 OID 114742)
-- Dependencies: 246
-- Data for Name: temporary_pass_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.temporary_pass_logs (id, temp_pass_id, action, performed_by_user_id, performed_by_role, remarks, old_status, new_status, "timestamp") FROM stdin;
1	1	submitted	\N	\N	Temporary gate pass submitted and forwarded to 	\N	pending_with_officer2	2025-08-14 08:20:23.199
2	1	officer_approved	5	officer2	Approved by DY.CME/C: Approved by officer2	pending_with_officer2	pending_with_chos	2025-08-14 08:45:36.921126
\.


--
-- TOC entry 5064 (class 0 OID 41097)
-- Dependencies: 236
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, session_token, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5062 (class 0 OID 41082)
-- Dependencies: 234
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, role, full_name, employee_id, is_active, created_at, railway_sse_id) FROM stdin;
10	ssebl	ssebl@gmail.com	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	sse	SSE BL	SSE003	t	2025-08-06 07:26:47.574725	\N
1	contract_user	contract@railway.gov	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	contract_section	Contract Section	CON001	t	2025-07-23 12:10:26.509663	\N
7	admin	admin@railway.gov	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	admin	System Administrator	ADM001	t	2025-07-23 12:10:26.509663	\N
4	awmc	officer1@railway.gov	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	officer1	AWM/C	OFF001	t	2025-07-23 12:10:26.509663	\N
8	awmw	aakram94@gmail.com	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	officer1	AWM/W	OFF003	t	2025-07-23 16:46:05.630909	\N
11	safety_officer	safety@railway.gov.in	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	safety_officer	Safety Officer	SAF002	t	2025-08-05 13:31:09.569672	\N
3	safety_user	crissatcwper@gmail.com	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	safety_officer	Safety Officer	SAF001	t	2025-07-23 12:10:26.509663	\N
6	chosnpb	npbcwper@gmail.com	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	chos_npb	Ch.OS/NPB	CHOS1	t	2025-07-23 12:10:26.509663	\N
5	dycmec	ramesh.dmy@gmail.com	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	officer2	DY.CME/C	OFF002	t	2025-07-23 12:10:26.509663	\N
2	ssewr	sse@railway.gov	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	sse	SSE WR	SSE001	t	2025-07-23 12:10:26.509663	\N
9	sseab	cwperwelfare@gmail.com	$2a$12$oXxXUvBx72Zwh4C66e7jTebuVUE.GuNQHqfYPoDnXdaBpYEn4n1eO	sse	SSE AB	SSE002	t	2025-08-06 07:26:47.574725	\N
\.


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 239
-- Name: application_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_logs_id_seq', 147, true);


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 231
-- Name: approval_workflow_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.approval_workflow_id_seq', 1, false);


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 225
-- Name: cmaster_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cmaster_id_seq', 18, true);


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 241
-- Name: email_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_notifications_id_seq', 103, true);


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 219
-- Name: firm_master_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.firm_master_id_seq', 10, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 227
-- Name: gate_pass_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gate_pass_applications_id_seq', 57, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 237
-- Name: gate_pass_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gate_pass_files_id_seq', 1, false);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 229
-- Name: gate_pass_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gate_pass_items_id_seq', 1, false);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 223
-- Name: officers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.officers_id_seq', 3, true);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 221
-- Name: railway_sse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.railway_sse_id_seq', 3, true);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 217
-- Name: shops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shops_id_seq', 5, true);


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 243
-- Name: temporary_gate_passes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.temporary_gate_passes_id_seq', 1, true);


--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 245
-- Name: temporary_pass_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.temporary_pass_logs_id_seq', 2, true);


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 235
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 1, false);


--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 233
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


-- Completed on 2025-08-15 16:16:05

--
-- PostgreSQL database dump complete
--

