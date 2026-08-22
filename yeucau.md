Về tổ chức code và Tài liệu										
1	Về tài liệu 									
1.1	đang không có tài liệu kỹ thuật về API 									
		url api, request, response trả về, các tham số của từng api								
1.2	không có các flow char, UML, sequence									
		cháu bảo AI vẽ bằng mermaid								
1.3	Mỗi lần làm làm task đang chưa tách nhánh									
		làm xong thì tạo PR, để có gì chú check cho tiện								
2	FrontEnd									
		FE đang sử dụng reactjs -> chuyển sang nextjs nó tối ưu cho SEO								
		Reactjs	Single-page Application							
		Nextjs	Server-side Rendering (SSR)							
										
3	BackEnd									
1.2.1	Tách mỗi bảng ra 1 file migrate riêng									
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
1.2.2	đang chưa phân biệt được khi nào cho vào repositories và khi nào sử dụng services									
	cháu bảo con AI nó đọc và tách code services sang repositories nhé									
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
1.2.3	Chưa có unitest cho các hàm đã viết									
	BE	unitest các repository								
		unitest các services								
		unitest các api								
	FE									
		unitest các services								
		unitest các api								
	test	e2e								
										
Giao diện										
1	Giao diện nhìn khá thô sơ									
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
2	Url bài viết phải lấy theo slug - sử dụng cho SEO									
2.1	Job chi tiết									
		http://localhost:5173/jobs/6								
	Tham khảo									
		https://itviec.com/it-jobs/senior-php-developer-fullstack-reactjs-laravel-firebook-5745								
										
	hoặc	https://{domain}/{category-slug-name}/{job-slug}-{job-id}								
		https://{domain}/{slug}-{job-id}								
		https://{domain}/{slug}-{job-id}.html								
		https://{domain}/{slug}-{job-id}.htm								
2.2	category									
	ex	http://localhost:5173/it-jobs-remote/java-spring-boot								
	Tương tự category cũng thế									
		http://localhost:5173/jobs?category=mobile								
										
		https://itviec.com/it-jobs/laravel								
	hoặc									
	ex	http://localhost:5173/it-jobs-remote/laravel								
										
3	thêm page tags									
		http://localhost:5173/tag/laravel								
		lấy các bài viết job theo các tag 								
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
	Tham khảo									
		https://www.careerlink.vn/en/tag/recruitment								
										
4	hiển thị thời gian									
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
	Tham khảo https://www.careerlink.vn/en/job/hcm-phu-my-manager-of-hrad-department/3547894?source=site									
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
	https://itviec.com/it-jobs/php?click_source=Navigation+menu&job_selected=senior-php-developer-fullstack-reactjs-laravel-firebook-5745									
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
										
5	Hiện tại chưa có đa ngôn ngữ cho FE									
	ngôn ngữ chính tiếng anh và tiếng việt									
	khi chuyển đa ngôn ngữ thì sẽ ko fix cứng code tiếng việt kiểu ntn									